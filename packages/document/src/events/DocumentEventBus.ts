import { EventEmitter } from "node:events";

import type { DocumentEvents } from "./DocumentEvents.js";

/**
 * Event bus for document lifecycle events.
 */
export class DocumentEventBus {
  private readonly emitter = new EventEmitter();

  public emit<K extends keyof DocumentEvents>(event: K, payload: DocumentEvents[K]): void {
    this.emitter.emit(event, payload);
  }

  public on<K extends keyof DocumentEvents>(
    event: K,
    listener: (payload: DocumentEvents[K]) => void
  ): () => void {
    this.emitter.on(event, listener);
    return () => this.emitter.off(event, listener);
  }

  public once<K extends keyof DocumentEvents>(
    event: K,
    listener: (payload: DocumentEvents[K]) => void
  ): void {
    this.emitter.once(event, listener);
  }

  public dispose(): void {
    this.emitter.removeAllListeners();
  }
}
