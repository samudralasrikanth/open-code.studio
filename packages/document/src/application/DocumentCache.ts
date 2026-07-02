import type { WorkspaceUri } from "@ocs/workspace";

import type { IDocument } from "../domain/Document.js";

import { DocumentRegistry } from "./DocumentRegistry.js";

export interface DocumentCachePolicy {
  /**
   * Maximum number of untouched documents to keep in memory.
   */
  maxDocuments: number;

  /**
   * Time in milliseconds before an untouched document can be evicted.
   */
  maxAgeMs: number;
}

const DEFAULT_CACHE_POLICY: DocumentCachePolicy = {
  maxDocuments: 50,
  maxAgeMs: 5 * 60 * 1000 // 5 minutes
};

interface CacheEntry {
  document: IDocument;
  lastAccessed: number;
  refCount: number;
}

/**
 * Wraps the DocumentRegistry with an LRU cache policy to ensure we don't hold
 * 500 documents in memory if the user opens a ton of files without editing them.
 */
export class DocumentCache {
  private readonly registry: DocumentRegistry = new DocumentRegistry();
  private readonly entries: Map<string, CacheEntry> = new Map();
  private readonly policy: DocumentCachePolicy;

  constructor(policy: Partial<DocumentCachePolicy> = {}) {
    this.policy = { ...DEFAULT_CACHE_POLICY, ...policy };
  }

  public get(uri: WorkspaceUri): IDocument | undefined {
    const key = uri.toString();
    const entry = this.entries.get(key);
    if (entry) {
      entry.lastAccessed = Date.now();
      return entry.document;
    }
    return undefined;
  }

  public has(uri: WorkspaceUri): boolean {
    return this.registry.has(uri);
  }

  public add(document: IDocument): void {
    this.registry.add(document);
    this.entries.set(document.uri.toString(), {
      document,
      lastAccessed: Date.now(),
      refCount: 0
    });

    this.evictIfNecessary();
  }

  public remove(uri: WorkspaceUri): boolean {
    const key = uri.toString();
    const entry = this.entries.get(key);

    if (entry) {
      entry.document.dispose();
      this.entries.delete(key);
      return this.registry.remove(uri);
    }

    return false;
  }

  /**
   * Mark a document as actively in use by an Editor or other consumer.
   * A document with a refCount > 0 will never be evicted.
   */
  public acquireReference(uri: WorkspaceUri): void {
    const entry = this.entries.get(uri.toString());
    if (entry) {
      entry.refCount++;
      entry.lastAccessed = Date.now();
    }
  }

  /**
   * Release a reference to a document.
   */
  public releaseReference(uri: WorkspaceUri): void {
    const entry = this.entries.get(uri.toString());
    if (entry && entry.refCount > 0) {
      entry.refCount--;
      entry.lastAccessed = Date.now();
    }
  }

  public getAll(): IDocument[] {
    return this.registry.getAll();
  }

  private evictIfNecessary(): void {
    if (this.entries.size <= this.policy.maxDocuments) return;

    // Find eviction candidates:
    // 1. Not dirty
    // 2. RefCount is 0
    // 3. Oldest lastAccessed
    let oldestEntry: CacheEntry | null = null;
    let oldestKey: string | null = null;

    for (const [key, entry] of this.entries.entries()) {
      if (entry.document.isDirty) continue;
      if (entry.refCount > 0) continue;

      if (!oldestEntry || entry.lastAccessed < oldestEntry.lastAccessed) {
        oldestEntry = entry;
        oldestKey = key;
      }
    }

    if (oldestEntry && oldestKey) {
      oldestEntry.document.dispose();
      this.entries.delete(oldestKey);
      this.registry.remove(oldestEntry.document.uri);
    }
  }
}
