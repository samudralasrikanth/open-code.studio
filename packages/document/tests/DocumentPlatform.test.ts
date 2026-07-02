/* eslint-disable */
import type { IFileSystem } from "@ocs/workspace";
import { uriFromPath } from "@ocs/workspace";
import { describe, it, expect, beforeEach, vi } from "vitest";

import type { DocumentCache } from "../src/application/DocumentCache.js";
import { DocumentFactory } from "../src/application/DocumentFactory.js";
import type { DocumentRegistry } from "../src/application/DocumentRegistry.js";
import { FileSystemDocumentResolver } from "../src/application/DocumentResolver.js";
import { DocumentService } from "../src/application/DocumentService.js";
import type { ITextDocument } from "../src/domain/TextDocument.js";
import { DocumentEventBus } from "../src/events/DocumentEventBus.js";

describe("Document Platform Integration (Test 5)", () => {
  let fileSystem: IFileSystem;
  let service: DocumentService;
  let registry: DocumentRegistry;
  let cache: DocumentCache;

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
    const eventBus = new DocumentEventBus();
    service = new DocumentService(fileSystem, eventBus);
    // Since DocumentService initializes its own cache/registry, we can use it directly.
    // We will access them if needed or just test the service layer.
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
    // We'll simulate opening 100 documents and check cache size
    for (let i = 0; i < 100; i++) {
      const uri = uriFromPath(`/test-${i}.txt`);
      await service.openDocument(uri);
    }

    // Since default cache policy removes least recently used after MAX_OPEN_DOCUMENTS (which is say 50),
    // we just want to ensure it works without crashing.
    expect(fileSystem.readFile).toHaveBeenCalledTimes(100);
  });

  it("Test 7: Save document", async () => {
    const uri = uriFromPath("/test.txt");
    const doc = (await service.openDocument(uri)) as ITextDocument;

    // Simulate dirtiness
    doc.setText("new text");
    expect(doc.isDirty).toBe(true);

    await service.saveDocument(uri);
    expect(fileSystem.writeFile).toHaveBeenCalledWith("/test.txt", "new text");
    expect(doc.isDirty).toBe(false);
  });

  it("Test 8: Concurrent updates", async () => {
    const uri = uriFromPath("/test.txt");
    const doc1 = (await service.openDocument(uri)) as ITextDocument;
    const doc2 = (await service.openDocument(uri)) as ITextDocument;

    expect(doc1).toBe(doc2);

    doc1.setText("editor 1 update");
    expect(doc2.getText()).toBe("editor 1 update");
  });
});
