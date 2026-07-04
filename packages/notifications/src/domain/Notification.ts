export type NotificationSeverity = "info" | "success" | "warning" | "error" | "critical";

export interface NotificationAction {
  readonly id: string;
  readonly label: string;
  readonly commandId?: string | undefined;
  readonly callback?: (() => void) | undefined;
}

export interface INotification {
  readonly id: string;
  readonly title: string;
  readonly message?: string | undefined;
  readonly severity: NotificationSeverity;
  readonly timestamp: Date;
  readonly source?: string | undefined;
  readonly persistent?: boolean | undefined;
  readonly actions?: NotificationAction[] | undefined;
  readonly progress?: number | undefined;
}
