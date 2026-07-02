import type { ExplorerNode } from "../domain/TreeModel.js";

/**
 * Event payloads for the Explorer Platform.
 */
export interface ExplorerNodeExpandedEvent {
  nodeId: string;
}

export interface ExplorerNodeCollapsedEvent {
  nodeId: string;
}

export interface ExplorerSelectionChangedEvent {
  selectedNodeIds: string[];
}

export interface ExplorerFileCreatedEvent {
  node: ExplorerNode;
}

export interface ExplorerFileDeletedEvent {
  nodeId: string;
}

export interface ExplorerFileRenamedEvent {
  oldNodeId: string;
  newNode: ExplorerNode;
}

export interface ExplorerFileMovedEvent {
  oldNodeId: string;
  newNode: ExplorerNode;
}

export interface ExplorerRefreshStartedEvent {
  providerId: string;
}

export interface ExplorerRefreshCompletedEvent {
  providerId: string;
}

export interface ExplorerDecorationsChangedEvent {
  nodeIds: string[];
}

export interface ExplorerFilterChangedEvent {
  filter: string;
}

export interface IExplorerEventBus {
  emit<K extends keyof ExplorerEventMap>(event: K, payload: ExplorerEventMap[K]): void;
  on<K extends keyof ExplorerEventMap>(
    event: K,
    listener: (payload: ExplorerEventMap[K]) => void
  ): void;
  off<K extends keyof ExplorerEventMap>(
    event: K,
    listener: (payload: ExplorerEventMap[K]) => void
  ): void;
}

export type ExplorerEventMap = {
  "explorer.nodeExpanded": ExplorerNodeExpandedEvent;
  "explorer.nodeCollapsed": ExplorerNodeCollapsedEvent;
  "explorer.selectionChanged": ExplorerSelectionChangedEvent;
  "explorer.fileCreated": ExplorerFileCreatedEvent;
  "explorer.fileDeleted": ExplorerFileDeletedEvent;
  "explorer.fileRenamed": ExplorerFileRenamedEvent;
  "explorer.fileMoved": ExplorerFileMovedEvent;
  "explorer.refreshStarted": ExplorerRefreshStartedEvent;
  "explorer.refreshCompleted": ExplorerRefreshCompletedEvent;
  "explorer.decorationsChanged": ExplorerDecorationsChangedEvent;
  "explorer.filterChanged": ExplorerFilterChangedEvent;
};
