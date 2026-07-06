import type { EditorInput } from "@ocs/editor";
import { MonacoEditorAdapter } from "@ocs/editor-monaco";
import React, { useEffect, useRef, useState } from "react";

import { useDocument } from "../../hooks/useDocument.js";

interface DocumentContent {
  uri: string;
  content: string;
  isReadonly: boolean;
}

interface MonacoEditorViewProps {
  input: { id: string };
}

export const MonacoEditorView: React.FC<MonacoEditorViewProps> = ({ input }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const adapterRef = useRef<MonacoEditorAdapter | null>(null);
  const [docContent, setDocContent] = useState<DocumentContent | null>(null);
  const { get } = useDocument();

  useEffect(() => {
    if (!containerRef.current) return;

    const adapter = new MonacoEditorAdapter();
    adapter.mount(containerRef.current);
    adapterRef.current = adapter;

    return () => {
      adapter.unmount();
      adapterRef.current = null;
    };
  }, []);

  useEffect(() => {
    const unsub = window.ocs.editor.onReveal((payload) => {
      if (input && payload.uri === input.id && adapterRef.current) {
        const editor = adapterRef.current.getEditor();
        if (editor && payload.selection) {
          editor.revealLineInCenter(payload.selection.startLineNumber);
          editor.setSelection(payload.selection);
          editor.focus();
        }
      }
    });

    return () => unsub();
  }, [input]);

  useEffect(() => {
    if (!input) return;

    // Fetch document from main process via IPC
    get(input.id)
      .then((doc) => {
        setDocContent(doc as DocumentContent);
      })
      .catch((err: unknown) => {
        console.error("Failed to fetch document", err);
      });
  }, [input, get]);

  useEffect(() => {
    if (adapterRef.current && docContent) {
      // Create a duck-typed EditorInput directly in the renderer
      // to avoid dynamic require() or bundling Node.js modules (fs, path).
      const mockDoc = {
        getText: () => docContent.content,
        setText: (text: string) => {
          docContent.content = text;
        },
        uri: { toString: () => docContent.uri }
      };

      const mockInput = {
        uri: { toString: () => docContent.uri },
        document: mockDoc
      };

      adapterRef.current.openInput(mockInput as unknown as EditorInput).catch((err: unknown) => {
        console.error("Failed to open input in Monaco:", err);
      });
    }
  }, [docContent]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};
