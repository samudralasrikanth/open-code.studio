import type { SessionSnapshot } from "../domain/SessionSnapshot.js";
import type { SessionStore } from "./SessionStore.js";
import type { EventBus } from "@ocs/common";
import { SessionEventTypes } from "@ocs/common/events";

export class SessionManager {
  private activeWorkspaceId: string | null = null;
  private currentSnapshot: SessionSnapshot | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly store: SessionStore,
    private readonly eventBus: EventBus
  ) {}

  public setActiveWorkspace(workspaceId: string): void {
    this.activeWorkspaceId = workspaceId;
    this.clearChordState();
  }

  public async loadSession(): Promise<SessionSnapshot | null> {
    if (!this.activeWorkspaceId) return null;
    const snapshot = await this.store.load(this.activeWorkspaceId);
    this.currentSnapshot = snapshot;
    return snapshot;
  }

  public updateSnapshot(snapshot: Partial<SessionSnapshot>, immediate = false): void {
    if (!this.activeWorkspaceId) return;

    const baseSnapshot = this.currentSnapshot || {
      version: 1,
      workspaceId: this.activeWorkspaceId,
      windowState: {
        width: 1024,
        height: 768,
        x: 0,
        y: 0,
        maximized: false,
        fullscreen: false,
        zoom: 1
      },
      editorLayout: { groups: [] },
      terminalState: { tabs: [] },
      viewState: {}
    };

    const updated = {
      ...baseSnapshot,
      ...snapshot,
      version: 1,
      workspaceId: this.activeWorkspaceId
    } as SessionSnapshot;

    this.currentSnapshot = updated;

    // Publish to Event Bus
    this.eventBus.publish(SessionEventTypes.SESSION_MODIFIED, {
      workspaceId: this.activeWorkspaceId,
      snapshot: updated
    });

    if (immediate) {
      this.saveImmediately();
    } else {
      this.triggerDebouncedSave();
    }
  }

  public async saveImmediately(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.activeWorkspaceId && this.currentSnapshot) {
      await this.store.save(this.activeWorkspaceId, this.currentSnapshot);
    }
  }

  private triggerDebouncedSave(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      this.debounceTimer = null;
      if (this.activeWorkspaceId && this.currentSnapshot) {
        await this.store.save(this.activeWorkspaceId, this.currentSnapshot);
      }
    }, 500); // 500ms debounce
  }

  private clearChordState(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.currentSnapshot = null;
  }
}
