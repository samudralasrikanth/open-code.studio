/* eslint-disable */
import type { EditorInput } from "@ocs/editor";
import { MonacoEditorAdapter } from "@ocs/editor-monaco";
import React, { useEffect, useRef } from "react";

interface MonacoEditorViewProps {
  input: EditorInput;
}

export const MonacoEditorView: React.FC<MonacoEditorViewProps> = ({ input }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const adapterRef = useRef<MonacoEditorAdapter | null>(null);
  const [docContent, setDocContent] = useState<any>(null);

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
    if (!input) return;

    // Fetch document from main process via IPC
    window.ocs.document
      .get(input.id || input)
      .then((doc) => {
        setDocContent(doc);
      })
      .catch((err) => {
        console.error("Failed to fetch document", err);
      });
  }, [input]);

  useEffect(() => {
    if (adapterRef.current && docContent) {
      // Create a dummy EditorInput to pass to the adapter
      // Since adapter expects a DocumentEditorInput which wraps an IDocument
      // We will just patch the adapter directly for now, or mock an input
      const { uriFromString } = require("@ocs/workspace");
      const { DocumentEditorInput } = require("@ocs/editor");
      const { TextDocumentImpl } = require("@ocs/document");

      const doc = new TextDocumentImpl(
        uriFromString(docContent.uri),
        docContent.content,
        "plaintext", // language doesn't matter much for now, adapter sets it
        "utf-8",
        docContent.isReadonly
      );
      const editorInput = new DocumentEditorInput(doc);

      adapterRef.current.openInput(editorInput).catch((err: any) => {
        console.error("Failed to open input in Monaco:", err);
      });
    }
  }, [docContent]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};
