import { randomUUID } from "node:crypto";
import type { INotification } from "../domain/Notification.js";
import type { NotificationQueue } from "./NotificationQueue.js";
import type { NotificationHistory } from "./NotificationHistory.js";

export class NotificationService {
  private readonly pausedTimeouts = new Set<string>();

  constructor(
    private readonly queue: NotificationQueue,
    private readonly history: NotificationHistory
  ) {}

  public create(opt: Omit<INotification, "id" | "timestamp">): string {
    const id = randomUUID();
    const notification: INotification = {
      ...opt,
      id,
      timestamp: new Date()
    };
    this.queue.add(notification);
    return id;
  }

  public update(id: string, updates: Partial<INotification>): void {
    this.queue.update(id, updates);
  }

  public dismiss(id: string): void {
    const notification = this.queue.remove(id);
    if (notification) {
      this.history.add(notification);
    }
  }

  public get(id: string): INotification | undefined {
    return this.queue.get(id);
  }

  public getActive(): INotification[] {
    return this.queue.getAll();
  }

  public getHistory(): INotification[] {
    return this.history.getList();
  }

  public clear(): void {
    const active = this.queue.getAll();
    for (const item of active) {
      this.dismiss(item.id);
    }
  }

  public clearBySource(source: string): void {
    const active = this.queue.getAll();
    for (const item of active) {
      if (item.source === source) {
        this.dismiss(item.id);
      }
    }
  }

  public clearErrors(): void {
    const active = this.queue.getAll();
    for (const item of active) {
      if (item.severity === "error" || item.severity === "critical") {
        this.dismiss(item.id);
      }
    }
  }

  public pause(id: string): void {
    this.pausedTimeouts.add(id);
  }

  public resume(id: string): void {
    this.pausedTimeouts.delete(id);
  }

  public isPaused(id: string): boolean {
    return this.pausedTimeouts.has(id);
  }
}
