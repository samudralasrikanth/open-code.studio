import { EventEmitter } from "node:events";

import type { EditorEvents } from "./EditorEvents.js";

export class EditorEventBus {
  private readonly emitter = new EventEmitter();

  public emit<K extends keyof EditorEvents>(event: K, payload: EditorEvents[K]): void {
    this.emitter.emit(event, payload);
  }

  public on<K extends keyof EditorEvents>(
    event: K,
    listener: (payload: EditorEvents[K]) => void
  ): () => void {
    this.emitter.on(event, listener);
    return () => this.emitter.off(event, listener);
  }

  public once<K extends keyof EditorEvents>(
    event: K,
    listener: (payload: EditorEvents[K]) => void
  ): void {
    this.emitter.once(event, listener);
  }

  public dispose(): void {
    this.emitter.removeAllListeners();
  }
}
