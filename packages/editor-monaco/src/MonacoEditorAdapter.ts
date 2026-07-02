import { TextDocumentImpl } from "@ocs/document";
import type { IEditorAdapter, EditorInput } from "@ocs/editor";
import { DocumentEditorInput } from "@ocs/editor";
import { uriToPath } from "@ocs/workspace";
import * as monaco from "monaco-editor";

export class MonacoEditorAdapter implements IEditorAdapter {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private container: HTMLElement | null = null;
  private currentInput: EditorInput | null = null;
  private model: monaco.editor.ITextModel | null = null;

  public mount(container: HTMLElement): void {
    this.container = container;
    this.editor = monaco.editor.create(this.container, {
      theme: "vs-dark",
      automaticLayout: true,
      minimap: { enabled: false }
    });

    // Handle document changes and update our DocumentModel
    this.editor.onDidChangeModelContent(() => {
      if (this.currentInput instanceof DocumentEditorInput) {
        const doc = (this.currentInput as unknown as { document: unknown }).document;
        if (doc instanceof TextDocumentImpl && this.model) {
          doc.setText(this.model.getValue());
        }
      }
    });
  }

  public unmount(): void {
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.container = null;
  }

  public async openInput(input: EditorInput): Promise<void> {
    await Promise.resolve(); // satisfy require-await
    if (!this.editor) {
      throw new Error("Cannot open input. Editor is not mounted.");
    }

    this.currentInput = input;

    if (input instanceof DocumentEditorInput) {
      const doc = (input as unknown as { document: unknown }).document;
      if (doc instanceof TextDocumentImpl) {
        const text = doc.getText();

        // Determine language based on file extension
        let language = "plaintext";
        const path = uriToPath(input.uri);
        if (path.endsWith(".ts") || path.endsWith(".tsx")) language = "typescript";
        else if (path.endsWith(".js") || path.endsWith(".jsx")) language = "javascript";
        else if (path.endsWith(".json")) language = "json";
        else if (path.endsWith(".md")) language = "markdown";
        else if (path.endsWith(".css")) language = "css";
        else if (path.endsWith(".html")) language = "html";

        if (this.model) {
          this.model.dispose();
        }

        this.model = monaco.editor.createModel(
          text,
          language,
          monaco.Uri.parse(input.uri.toString())
        );
        this.editor.setModel(this.model);
        return;
      } else {
        throw new Error("Monaco editor adapter does not support binary documents yet.");
      }
    } else {
      throw new Error(`Unsupported EditorInput type: ${input.constructor.name}`);
    }
  }

  public focus(): void {
    if (this.editor) {
      this.editor.focus();
    }
  }
}
