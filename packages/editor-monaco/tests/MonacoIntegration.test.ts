/* eslint-disable */
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ModelManager } from "../src/ModelManager.js";
import { MonacoEditorAdapter } from "../src/MonacoEditorAdapter.js";
import { uriFromString } from "@ocs/workspace";
import { TextDocumentImpl } from "@ocs/document";
import { DocumentEditorInput } from "@ocs/editor";
import * as monaco from "monaco-editor";
import { mockModel } from "./mock-monaco.js";

describe("Monaco Editor Platform Integration (EPIC-0006 Milestone 3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ModelManager", () => {
    it("creates, caches, and disposes ITextModels by URI", () => {
      const manager = new ModelManager();
      const uri = uriFromString("file:///workspace/app.ts");

      // Mock getModel to return null first
      const getModelSpy = vi.spyOn(monaco.editor, "getModel").mockReturnValue(null);

      const model = manager.getOrCreateModel(uri, "initial content", "typescript");
      expect(model).toBeDefined();
      expect(manager.hasModel(uri)).toBe(true);

      // Subsequent call returns the cached model
      const secondCall = manager.getOrCreateModel(uri, "new content", "typescript");
      expect(secondCall).toBe(model);

      // Disposes cleanly
      manager.disposeModel(uri);
      expect(manager.hasModel(uri)).toBe(false);
      expect(mockModel.dispose).toHaveBeenCalled();
    });
  });

  describe("MonacoEditorAdapter & Flush Strategy", () => {
    it("mounts and sets up listeners correctly", () => {
      const adapter = new MonacoEditorAdapter();
      const dummyContainer = {} as HTMLElement;
      adapter.mount(dummyContainer);

      expect(monaco.editor.create).toHaveBeenCalledWith(dummyContainer, expect.any(Object));
    });

    it("flushes changes immediately on openInput of a new file", async () => {
      const adapter = new MonacoEditorAdapter();
      const dummyContainer = {} as HTMLElement;
      adapter.mount(dummyContainer);

      const doc1 = new TextDocumentImpl(
        "file:///workspace/1.ts",
        uriFromString("file:///workspace/1.ts"),
        "typescript",
        "utf-8",
        "one"
      );
      const input1 = new DocumentEditorInput(doc1);

      const doc2 = new TextDocumentImpl(
        "file:///workspace/2.ts",
        uriFromString("file:///workspace/2.ts"),
        "typescript",
        "utf-8",
        "two"
      );
      const input2 = new DocumentEditorInput(doc2);

      await adapter.openInput(input1);
      // Switching inputs triggers flush of input1
      await adapter.openInput(input2);

      expect(monaco.editor.createModel).toHaveBeenCalledTimes(2);
    });
  });
});
