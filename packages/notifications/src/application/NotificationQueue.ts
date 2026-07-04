import type { EventBus } from "@ocs/common";
import { NotificationEventTypes } from "@ocs/common/events";
import type { INotification } from "../domain/Notification.js";

export class NotificationQueue {
  private readonly active = new Map<string, INotification>();

  constructor(private readonly eventBus: EventBus) {}

  public add(notification: INotification): void {
    this.active.set(notification.id, notification);
    this.eventBus.publish(NotificationEventTypes.NOTIFICATION_CREATED, {
      id: notification.id,
      notification
    });
  }

  public update(id: string, updates: Partial<INotification>): void {
    const existing = this.active.get(id);
    if (!existing) return;

    const updated = { ...existing, ...updates };
    this.active.set(id, updated);

    this.eventBus.publish(NotificationEventTypes.NOTIFICATION_UPDATED, {
      id,
      notification: updated
    });
  }

  public remove(id: string): INotification | undefined {
    const existing = this.active.get(id);
    if (existing) {
      this.active.delete(id);
      this.eventBus.publish(NotificationEventTypes.NOTIFICATION_DISMISSED, {
        id,
        notification: existing
      });
    }
    return existing;
  }

  public get(id: string): INotification | undefined {
    return this.active.get(id);
  }

  public getAll(): INotification[] {
    return Array.from(this.active.values());
  }

  public clear(): void {
    const ids = Array.from(this.active.keys());
    for (const id of ids) {
      this.remove(id);
    }
  }
}
