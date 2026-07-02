import { type TreeModel } from "../domain/TreeModel.js";
import { type ExplorerEventBus } from "../events/ExplorerEventBus.js";
import { type ExplorerEventMap } from "../events/ExplorerEvents.js";

/**
 * ExplorerScheduler batches high-frequency events from the FileWatcher (like 5000 files changing)
 * before telling the TreeModel to rebuild or emitting IPC updates, saving the UI from crashing.
 */
export class ExplorerScheduler {
  private batchTimer: NodeJS.Timeout | null = null;
  private pendingEvents: Set<keyof ExplorerEventMap> = new Set();
  private readonly BATCH_DELAY_MS = 50; // Wait 50ms for events to settle before flushing

  constructor(
    private readonly treeModel: TreeModel,
    private readonly eventBus: ExplorerEventBus
  ) {}

  /**
   * Schedule a tree rebuild and UI update for the given event type.
   */
  public scheduleUpdate(event: keyof ExplorerEventMap) {
    this.pendingEvents.add(event);

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.flush();
    }, this.BATCH_DELAY_MS);
  }

  private flush() {
    this.batchTimer = null;

    if (this.pendingEvents.size === 0) return;

    // Trigger a refresh (since treeModel handles flattening in refresh)
    // we just use the treeModel root provider id if available or emit refreshCompleted.
    this.treeModel.getVisibleNodes();

    // For now, any scheduled update just re-emits a state changed event to the frontend
    // In the future, we could selectively update parts of the TreeModel before emitting
    this.eventBus.emit("explorer.refreshCompleted", { providerId: "explorer.provider.workspace" });

    this.pendingEvents.clear();
  }
}
