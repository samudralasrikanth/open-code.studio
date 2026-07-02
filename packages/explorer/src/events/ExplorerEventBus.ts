import { EventEmitter } from "node:events";

import type { IExplorerEventBus, ExplorerEventMap } from "./ExplorerEvents.js";

export class ExplorerEventBus implements IExplorerEventBus {
  private emitter = new EventEmitter();

  public emit<K extends keyof ExplorerEventMap>(event: K, payload: ExplorerEventMap[K]): void {
    this.emitter.emit(event, payload);
  }

  public on<K extends keyof ExplorerEventMap>(
    event: K,
    listener: (payload: ExplorerEventMap[K]) => void
  ): void {
    this.emitter.on(event, listener);
  }

  public off<K extends keyof ExplorerEventMap>(
    event: K,
    listener: (payload: ExplorerEventMap[K]) => void
  ): void {
    this.emitter.off(event, listener);
  }
}
