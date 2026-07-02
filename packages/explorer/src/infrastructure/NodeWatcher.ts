import * as path from "node:path";

import type { WorkspaceUri } from "@ocs/workspace";
import { uriScheme, uriToPath, uriFromString } from "@ocs/workspace";
import type { AsyncSubscription } from "@parcel/watcher";
import watcher from "@parcel/watcher";

import type {
  IFileWatcher,
  FileWatchCallback,
  FileWatchEvent
} from "../application/FileWatcher.js";
import { FileWatchEventType } from "../application/FileWatcher.js";

const DEFAULT_IGNORES = [
  ".DS_Store",
  ".git",
  "node_modules",
  "dist",
  "coverage",
  ".turbo",
  ".next",
  ".cache",
  ".idea",
  ".vscode",
  "Thumbs.db",
  "__MACOSX"
];

export class NodeWatcher implements IFileWatcher {
  private subscriptions: Map<string, AsyncSubscription> = new Map();
  private ignoreList: Set<string> = new Set(DEFAULT_IGNORES);

  // Simple debounce queue: fsPath -> FileWatchEvent
  private pendingEvents: Map<string, FileWatchEvent> = new Map();
  private debounceTimeout: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_MS = 50;

  constructor(private callback?: FileWatchCallback) {}

  public async watch(root: WorkspaceUri, callback: FileWatchCallback): Promise<void> {
    if (uriScheme(root) !== "file") {
      throw new Error(`NodeWatcher only supports 'file' scheme, got: ${uriScheme(root)}`);
    }

    const fsPath = uriToPath(root);
    if (this.subscriptions.has(fsPath)) {
      return; // Already watching
    }

    // Assign the callback if not passed in constructor, or support multiple callbacks later.
    // For now we just use a single global or per-watch callback
    const activeCallback = callback || this.callback;

    const subscription = await watcher.subscribe(fsPath, (err, events) => {
      if (err) {
        console.error("File watcher error:", err);
        return;
      }

      for (const event of events) {
        if (this.isIgnored(event.path)) {
          continue;
        }

        let type = FileWatchEventType.Changed;
        if (event.type === "create") type = FileWatchEventType.Created;
        else if (event.type === "delete") type = FileWatchEventType.Deleted;
        else if (event.type === "update") type = FileWatchEventType.Changed;

        const uri = uriFromString(`file://${event.path.replace(/\\/g, "/")}`);

        // Push to pending events for debouncing
        // In a real robust system, we might merge create+delete = nothing, etc.
        this.pendingEvents.set(event.path, { type, uri });
      }

      this.scheduleFlush(activeCallback);
    });

    this.subscriptions.set(fsPath, subscription);
  }

  public async unwatch(root: WorkspaceUri): Promise<void> {
    const fsPath = uriToPath(root);
    const subscription = this.subscriptions.get(fsPath);
    if (subscription) {
      await subscription.unsubscribe();
      this.subscriptions.delete(fsPath);
    }
  }

  public async dispose(): Promise<void> {
    const unsubscribes = Array.from(this.subscriptions.values()).map((sub) => sub.unsubscribe());
    await Promise.all(unsubscribes);
    this.subscriptions.clear();

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    this.pendingEvents.clear();
  }

  private isIgnored(fsPath: string): boolean {
    const parts = fsPath.split(path.sep);
    return parts.some((part) => this.ignoreList.has(part));
  }

  private scheduleFlush(callback?: FileWatchCallback): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      if (this.pendingEvents.size > 0 && callback) {
        const events = Array.from(this.pendingEvents.values());
        callback(events);
        this.pendingEvents.clear();
      }
      this.debounceTimeout = null;
    }, this.DEBOUNCE_MS);
  }
}
