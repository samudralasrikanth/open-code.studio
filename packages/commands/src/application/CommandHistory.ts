import type { EventBus } from "@ocs/common";

/**
 * Tracks recent commands.
 */
export class CommandHistory {
  private recentCommandIds: string[] = [];
  private readonly maxHistory = 20;

  constructor(private eventBus: EventBus) {
    this.eventBus.subscribe("command.executed", this.onCommandExecuted.bind(this));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onCommandExecuted(event: any): void {
    const { commandId } = event;
    if (commandId) {
      this.addRecent(commandId);
    }
  }

  private addRecent(commandId: string): void {
    // Remove if already exists to push to front
    this.recentCommandIds = this.recentCommandIds.filter((id) => id !== commandId);
    this.recentCommandIds.unshift(commandId);

    if (this.recentCommandIds.length > this.maxHistory) {
      this.recentCommandIds.pop();
    }
  }

  public getRecentIds(): string[] {
    return [...this.recentCommandIds];
  }
}
