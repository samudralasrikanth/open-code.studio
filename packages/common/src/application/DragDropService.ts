import { URI } from "../domain/URI.js";

export interface DragDropEvent {
  sourceUris: URI[];
  targetUri: URI;
  operation: "copy" | "move";
}

export class DragDropService {
  private static _instance: DragDropService;
  private _dragSources: URI[] | null = null;
  private _listeners: Set<(e: DragDropEvent) => void> = new Set();

  private constructor() {}

  public static getInstance(): DragDropService {
    if (!DragDropService._instance) {
      DragDropService._instance = new DragDropService();
    }
    return DragDropService._instance;
  }

  public beginDrag(uris: URI[]): void {
    this._dragSources = [...uris];
  }

  public getDragSources(): URI[] | null {
    return this._dragSources;
  }

  public endDrag(): void {
    this._dragSources = null;
  }

  public drop(targetUri: URI, operation: "copy" | "move"): void {
    if (!this._dragSources || this._dragSources.length === 0) return;

    const event: DragDropEvent = {
      sourceUris: this._dragSources,
      targetUri,
      operation
    };

    for (const listener of this._listeners) {
      try {
        listener(event);
      } catch (e) {
        console.error("Error in drag drop listener", e);
      }
    }

    this.endDrag();
  }

  public onDrop(listener: (e: DragDropEvent) => void): { dispose: () => void } {
    this._listeners.add(listener);
    return {
      dispose: () => {
        this._listeners.delete(listener);
      }
    };
  }
}
