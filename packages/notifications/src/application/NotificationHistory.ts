import type { INotification } from "../domain/Notification.js";

export class NotificationHistory {
  private historyList: INotification[] = [];
  private readonly maxLimit = 100;

  public add(notification: INotification): void {
    // Avoid duplicates
    this.historyList = this.historyList.filter((item) => item.id !== notification.id);
    this.historyList.unshift(notification);

    if (this.historyList.length > this.maxLimit) {
      this.historyList.pop();
    }
  }

  public getList(): INotification[] {
    return [...this.historyList];
  }

  public clear(): void {
    this.historyList = [];
  }
}
