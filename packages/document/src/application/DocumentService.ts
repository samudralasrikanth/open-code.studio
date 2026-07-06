import { uriToPath, type WorkspaceUri, type IFileSystem } from "@ocs/workspace";

import { SaveState } from "../domain/Document.js";
import type { IDocument } from "../domain/Document.js";
import { DocumentEventBus } from "../events/DocumentEventBus.js";
import { DocumentEventTypes } from "../events/DocumentEvents.js";

import { DocumentCache } from "./DocumentCache.js";
import { DocumentFactory, TextDocumentImpl, BinaryDocumentImpl } from "./DocumentFactory.js";
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
   * Updates the document text in the cache, marking it dirty.
   */
  public updateDocumentText(uri: WorkspaceUri, text: string): void {
    const doc = this.documentCache.get(uri);
    if (!doc) {
      throw new Error(`Document not found in registry: ${uri.toString()}`);
    }

    if (doc instanceof TextDocumentImpl) {
      if (doc.getText() !== text) {
        doc.setText(text);
        this.eventBus.emit(DocumentEventTypes.DOCUMENT_CHANGED, {
          uri,
          isDirty: true
        });
      }
    }
  }

  /**
   * Reverts a document to its state on disk.
   */
  public async revertDocument(uri: WorkspaceUri): Promise<void> {
    const doc = this.documentCache.get(uri);
    if (!doc) {
      throw new Error(`Document not found in registry: ${uri.toString()}`);
    }

    if (doc instanceof TextDocumentImpl) {
      const content = await this.fileSystem.readFile(uriToPath(uri));
      doc.revertContent(content);

      this.eventBus.emit(DocumentEventTypes.DOCUMENT_REVERTED, { uri });
      this.eventBus.emit(DocumentEventTypes.DOCUMENT_CHANGED, {
        uri,
        isDirty: false
      });
    }
  }

  /**
   * Saves a document to its underlying storage (e.g. FileSystem).
   */
  public async saveDocument(uri: WorkspaceUri): Promise<void> {
    const doc = this.documentCache.get(uri);
    if (!doc) {
      throw new Error(`Document not found in registry: ${uri.toString()}`);
    }

    if (doc.saveState !== SaveState.Dirty) {
      return; // Nothing to save or already saving/clean
    }

    if (doc instanceof TextDocumentImpl) {
      if (doc.isReadonly) {
        throw new Error("Cannot save read-only document.");
      }
      doc.saveState = SaveState.Saving;
      try {
        const path = uriToPath(uri);
        if (doc.diskMtimeMs) {
          try {
            const stat = await this.fileSystem.stat(path);
            if (stat.mtimeMs > doc.diskMtimeMs) {
              doc.saveState = SaveState.SaveFailed;
              throw new Error("Conflict: File has been modified externally since it was opened.");
            }
          } catch (statError: any) {
            // Ignore if file doesn't exist, we are creating it
          }
        }
        await this.fileSystem.writeFile(path, doc.getText());
        doc.saveState = SaveState.Clean;
        try {
          const newStat = await this.fileSystem.stat(path);
          doc.diskMtimeMs = newStat.mtimeMs;
        } catch {
          // Ignore
        }

        this.eventBus.emit(DocumentEventTypes.DOCUMENT_SAVED, { uri });
        this.eventBus.emit(DocumentEventTypes.DOCUMENT_CHANGED, {
          uri,
          isDirty: false
        });
      } catch (error) {
        doc.saveState = SaveState.SaveFailed;
        throw error;
      }
    } else if (doc instanceof BinaryDocumentImpl) {
      if (doc.isReadonly) {
        throw new Error("Cannot save read-only document.");
      }
      doc.saveState = SaveState.Saving;
      try {
        const path = uriToPath(uri);
        if (doc.diskMtimeMs) {
          try {
            const stat = await this.fileSystem.stat(path);
            if (stat.mtimeMs > doc.diskMtimeMs) {
              doc.saveState = SaveState.SaveFailed;
              throw new Error("Conflict: File has been modified externally since it was opened.");
            }
          } catch (statError: any) {
            // Ignore if file doesn't exist, we are creating it
          }
        }
        throw new Error("Saving binary documents is not yet supported by FileSystem");
      } catch (error) {
        doc.saveState = SaveState.SaveFailed;
        throw error;
      }
    }
  }
}
