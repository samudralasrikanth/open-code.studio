import type { WorkspaceUri } from "@ocs/workspace";

import type { IDocument } from "../domain/Document.js";

/**
 * Registry of currently open documents.
 */
export class DocumentRegistry {
  private readonly documents: Map<string, IDocument> = new Map();

  /**
   * Retrieves a document if it exists in the registry.
   */
  public get(uri: WorkspaceUri): IDocument | undefined {
    return this.documents.get(uri.toString());
  }

  /**
   * Checks if a document exists in the registry.
   */
  public has(uri: WorkspaceUri): boolean {
    return this.documents.has(uri.toString());
  }

  /**
   * Adds a document to the registry. Throws if a document with the same URI already exists.
   */
  public add(document: IDocument): void {
    const key = document.uri.toString();
    if (this.documents.has(key)) {
      throw new Error(`Document already exists in registry: ${key}`);
    }
    this.documents.set(key, document);
  }

  /**
   * Removes a document from the registry.
   */
  public remove(uri: WorkspaceUri): boolean {
    return this.documents.delete(uri.toString());
  }

  /**
   * Returns all currently registered documents.
   */
  public getAll(): IDocument[] {
    return Array.from(this.documents.values());
  }
}
