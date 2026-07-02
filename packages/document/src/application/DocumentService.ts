import { uriToPath, type WorkspaceUri, type IFileSystem } from "@ocs/workspace";

import type { IDocument } from "../domain/Document.js";
import type { ITextDocument } from "../domain/TextDocument.js";
import { DocumentEventBus } from "../events/DocumentEventBus.js";
import { DocumentEventTypes } from "../events/DocumentEvents.js";

import { DocumentCache } from "./DocumentCache.js";
import { DocumentFactory } from "./DocumentFactory.js";
import { FileSystemDocumentResolver } from "./DocumentResolver.js";

export class DocumentService {
  private readonly documentCache: DocumentCache;
  private readonly resolver: FileSystemDocumentResolver;

  constructor(
    private readonly fileSystem: IFileSystem,
    public readonly eventBus: DocumentEventBus = new DocumentEventBus(),
    documentFactory: DocumentFactory = new DocumentFactory()
  ) {
    this.documentCache = new DocumentCache();
    this.resolver = new FileSystemDocumentResolver(fileSystem, documentFactory);
  }

  /**
   * Opens a document or retrieves it from cache.
   * Increments the reference count if it's already open.
   */
  public async openDocument(uri: WorkspaceUri): Promise<IDocument> {
    let doc = this.documentCache.get(uri);

    if (!doc) {
      if (this.resolver.canResolve(uri)) {
        doc = await this.resolver.resolve(uri);
        this.documentCache.add(doc);
        this.eventBus.emit(DocumentEventTypes.DOCUMENT_OPENED, { uri });
      } else {
        throw new Error(`Cannot resolve document: ${uri.toString()}`);
      }
    }

    // Acquire a reference so it doesn't get evicted while the editor is showing it
    this.documentCache.acquireReference(uri);
    return doc;
  }

  /**
   * Closes a document, decrementing its reference count.
   * It may be evicted from the cache if the refCount drops to 0 and the cache is full.
   */
  public closeDocument(uri: WorkspaceUri): void {
    this.documentCache.releaseReference(uri);
    // Note: the document might not actually be disposed if it's cached or dirty
    this.eventBus.emit(DocumentEventTypes.DOCUMENT_CLOSED, { uri });
  }

  /**
   * Saves a document to its underlying storage (e.g. FileSystem).
   */
  public async saveDocument(uri: WorkspaceUri): Promise<void> {
    const doc = this.documentCache.get(uri);
    if (!doc) {
      throw new Error(`Document not found in registry: ${uri.toString()}`);
    }

    if (!doc.isDirty) {
      return; // Nothing to save
    }

    if (doc.type === "text") {
      const textDoc = doc as ITextDocument;
      await this.fileSystem.writeFile(uriToPath(uri), textDoc.getText());
      (textDoc as { isDirty: boolean }).isDirty = false; // Internal cast for mutation
    } else if (doc.type === "binary") {
      // In a real implementation we would have writeFileBuffer on IFileSystem
      // const binDoc = doc as IBinaryDocument;
      // await this.fileSystem.writeFileBuffer(uri, binDoc.getBuffer());
      throw new Error("Saving binary documents is not yet supported by FileSystem");
    }

    this.eventBus.emit(DocumentEventTypes.DOCUMENT_SAVED, { uri });
  }
}
