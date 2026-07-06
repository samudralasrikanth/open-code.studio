import type { EditorInput, IEditorAdapter } from "@ocs/editor";
import type { WorkspaceUri } from "@ocs/workspace";
import * as monaco from "monaco-editor";

import { ModelManager } from "./ModelManager.js";

interface OcsWindow {
  ocs?: {
    document?: {
      update: (uri: string, content: string) => Promise<void>;
    };
  };
}

interface DuckDocument {
  getText(): string;
  setText(text: string): void;
  uri: { toString(): string };
}

interface DuckInput {
  uri: { toString(): string };
  document?: DuckDocument;
}

export class MonacoEditorAdapter implements IEditorAdapter {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private container: HTMLElement | null = null;
  private currentInput: EditorInput | null = null;
  private model: monaco.editor.ITextModel | null = null;
  private readonly modelManager = new ModelManager();
  private debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  private cleanupFlushListener: (() => void) | undefined = undefined;

  public mount(container: HTMLElement): void {
    this.container = container;
    this.editor = monaco.editor.create(this.container, {
      value: "",
      language: "plaintext",
      theme: "vs-dark",
      automaticLayout: true,
      minimap: { enabled: false }
    });

    if (typeof window !== "undefined" && (window as any).ocs?.editor?.onRequestFlush) {
      this.cleanupFlushListener = (window as any).ocs.editor.onRequestFlush(() => {
        this.flushImmediately();
        if ((window as any).ocs.editor.sendFlushComplete) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          (window as any).ocs.editor.sendFlushComplete();
        }
      });
    }

    // Handle document changes and update renderer model immediately
    this.editor.onDidChangeModelContent(() => {
      const input = this.currentInput as DuckInput | null;
      const doc = input?.document;
      if (doc && typeof doc.setText === "function" && this.model) {
        const content = this.model.getValue();
        // Update local renderer document model immediately
        doc.setText(content);

        // Schedule debounced flush to main process
        const uri = input?.uri || doc.uri;
        if (uri) {
          this.scheduleFlush(uri.toString(), content);
        }
      }
    });

    // Flush immediately when editor loses focus
    this.editor.onDidBlurEditorText(() => {
      this.flushImmediately();
    });
  }

  public unmount(): void {
    this.flushImmediately();
    if (this.cleanupFlushListener) {
      this.cleanupFlushListener();
      this.cleanupFlushListener = undefined;
    }
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
    this.modelManager.disposeAll();
    this.model = null;
    this.container = null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async openInput(input: EditorInput): Promise<void> {
    // Flush changes from previous input
    this.flushImmediately();

    if (!this.editor) {
      throw new Error("Cannot open input. Editor is not mounted.");
    }

    this.currentInput = input;

    const duckInput = input as unknown as DuckInput;
    const doc = duckInput.document;
    if (doc && typeof doc.getText === "function") {
      const text = doc.getText();
      const uri = duckInput.uri;
      if (uri) {
        // Determine language based on file extension
        let language = "plaintext";
        const pathStr = uri.toString();
        if (pathStr.endsWith(".ts") || pathStr.endsWith(".tsx")) language = "typescript";
        else if (pathStr.endsWith(".js") || pathStr.endsWith(".jsx")) language = "javascript";
        else if (pathStr.endsWith(".json")) language = "json";
        else if (pathStr.endsWith(".md")) language = "markdown";
        else if (pathStr.endsWith(".css")) language = "css";
        else if (pathStr.endsWith(".html")) language = "html";

        this.model = this.modelManager.getOrCreateModel(
          uri as unknown as WorkspaceUri,
          text,
          language
        );
        this.editor.setModel(this.model);
        return;
      }
    }

    throw new Error(`Unsupported EditorInput type`);
  }

  public focus(): void {
    if (this.editor) {
      this.editor.focus();
    }
  }

  public getEditor(): monaco.editor.IStandaloneCodeEditor | null {
    return this.editor;
  }

  private scheduleFlush(uriStr: string, content: string): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.debounceTimeout = setTimeout(() => {
      this.flushToMain(uriStr, content);
    }, 300);
  }

  private flushImmediately(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    const input = this.currentInput as DuckInput | null;
    const doc = input?.document;
    if (doc && typeof doc.setText === "function" && this.model) {
      const uri = input?.uri || doc.uri;
      if (uri) {
        this.flushToMain(uri.toString(), this.model.getValue());
      }
    }
  }

  private flushToMain(uriStr: string, content: string): void {
    if (typeof window !== "undefined") {
      const ocsWindow = window as unknown as OcsWindow;
      if (ocsWindow?.ocs?.document?.update) {
        ocsWindow.ocs.document.update(uriStr, content).catch((err: unknown) => {
          console.error("Failed to flush document update to main process:", err);
        });
      }
    }
  }
}
