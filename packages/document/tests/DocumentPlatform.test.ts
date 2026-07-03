/* eslint-disable */
import type { IFileSystem } from "@ocs/workspace";
import { uriFromPath } from "@ocs/workspace";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { SaveState } from "../src/domain/Document.js";
import { DocumentService } from "../src/application/DocumentService.js";
import type { ITextDocument } from "../src/domain/TextDocument.js";
import { DocumentEventBus } from "../src/events/DocumentEventBus.js";
import { DocumentEventTypes } from "../src/events/DocumentEvents.js";
import { UndoRedoService } from "../src/application/UndoRedoService.js";

describe("Document Platform Integration (EPIC-0006 Milestone 1)", () => {
  let fileSystem: IFileSystem;
  let service: DocumentService;
  let eventBus: DocumentEventBus;

  beforeEach(() => {
    fileSystem = {
      stat: vi
        .fn()
        .mockResolvedValue({ isDirectory: false, isFile: true, sizeBytes: 10, mtimeMs: 1 }),
      exists: vi.fn().mockResolvedValue(true),
      readFile: vi.fn().mockResolvedValue("hello world"),
      writeFile: vi.fn().mockResolvedValue(undefined),
      mkdir: vi.fn(),
      join: (...args: string[]) => args.join("/")
    };
    eventBus = new DocumentEventBus();
    service = new DocumentService(fileSystem, eventBus);
  });

  it("Test 5: Open same file twice -> 1 document, 1 model", async () => {
    const uri = uriFromPath("/test.txt");

    const doc1 = await service.openDocument(uri);
    const doc2 = await service.openDocument(uri);

    expect(doc1).toBe(doc2);
    expect(fileSystem.readFile).toHaveBeenCalledTimes(1);
    expect((service as any).documentCache.get(uri)).toBe(doc1);
  });

  it("Test 6: Open 100 files -> stable memory", async () => {
    for (let i = 0; i < 100; i++) {
      const uri = uriFromPath(`/test-${i}.txt`);
      await service.openDocument(uri);
    }
    expect(fileSystem.readFile).toHaveBeenCalledTimes(100);
  });

  it("Test 7: Save document", async () => {
    const uri = uriFromPath("/test.txt");
    const doc = (await service.openDocument(uri)) as ITextDocument;

    doc.setText("new text");
    expect(doc.isDirty).toBe(true);
    expect(doc.saveState).toBe(SaveState.Dirty);

    let savedFired = false;
    let changedFired = false;
    eventBus.on(DocumentEventTypes.DOCUMENT_SAVED, () => {
      savedFired = true;
    });
    eventBus.on(DocumentEventTypes.DOCUMENT_CHANGED, (payload) => {
      if (!payload.isDirty) changedFired = true;
    });

    await service.saveDocument(uri);
    expect(fileSystem.writeFile).toHaveBeenCalledWith("/test.txt", "new text");
    expect(doc.isDirty).toBe(false);
    expect(doc.saveState).toBe(SaveState.Clean);
    expect(savedFired).toBe(true);
    expect(changedFired).toBe(true);
  });

  it("Test 8: Concurrent updates", async () => {
    const uri = uriFromPath("/test.txt");
    const doc1 = (await service.openDocument(uri)) as ITextDocument;
    const doc2 = (await service.openDocument(uri)) as ITextDocument;

    expect(doc1).toBe(doc2);

    doc1.setText("editor 1 update");
    expect(doc2.getText()).toBe("editor 1 update");
  });

  it("Test 9: updateDocumentText with event", async () => {
    const uri = uriFromPath("/test.txt");
    const doc = (await service.openDocument(uri)) as ITextDocument;

    let changedEvent: any = null;
    eventBus.on(DocumentEventTypes.DOCUMENT_CHANGED, (payload) => {
      changedEvent = payload;
    });

    service.updateDocumentText(uri, "updated editor text");
    expect(doc.getText()).toBe("updated editor text");
    expect(doc.isDirty).toBe(true);
    expect(doc.saveState).toBe(SaveState.Dirty);
    expect(changedEvent).toEqual({ uri, isDirty: true });
  });

  it("Test 10: revertDocument with event", async () => {
    const uri = uriFromPath("/test.txt");
    const doc = (await service.openDocument(uri)) as ITextDocument;

    doc.setText("unsaved modification");
    expect(doc.isDirty).toBe(true);

    let revertedFired = false;
    let changedFired = false;
    eventBus.on(DocumentEventTypes.DOCUMENT_REVERTED, () => {
      revertedFired = true;
    });
    eventBus.on(DocumentEventTypes.DOCUMENT_CHANGED, (payload) => {
      if (!payload.isDirty) changedFired = true;
    });

    await service.revertDocument(uri);
    expect(doc.getText()).toBe("hello world"); // restored from disk
    expect(doc.isDirty).toBe(false);
    expect(doc.saveState).toBe(SaveState.Clean);
    expect(revertedFired).toBe(true);
    expect(changedFired).toBe(true);
  });

  it("Test 11: UndoRedoService stub stack operations", () => {
    const service = new UndoRedoService();
    const uri = uriFromPath("/test.txt");

    expect(service.canUndo(uri)).toBe(false);
    expect(service.canRedo(uri)).toBe(false);

    service.pushEdit(uri, "edit-1");
    expect(service.canUndo(uri)).toBe(true);
    expect(service.canRedo(uri)).toBe(false);

    service.undo(uri);
    expect(service.canUndo(uri)).toBe(false);
    expect(service.canRedo(uri)).toBe(true);

    service.redo(uri);
    expect(service.canUndo(uri)).toBe(true);
    expect(service.canRedo(uri)).toBe(false);

    service.clear(uri);
    expect(service.canUndo(uri)).toBe(false);
  });
});
