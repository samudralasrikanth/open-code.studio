function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

import { PlatformError } from "../../errors/src/index.js";

export interface PlatformEvent<TPayload = unknown> {
  readonly id: string;
  readonly type: string;
  readonly payload: TPayload;
  readonly occurredAt: Date;
  readonly correlationId?: string;
}

export type EventHandler<TPayload = unknown> = (
  event: PlatformEvent<TPayload>
) => void | Promise<void>;

export interface EventBusOptions {
  readonly maxRetries?: number;
}

export interface DeadLetterEvent {
  readonly event: PlatformEvent;
  readonly error: unknown;
  readonly failedAt: Date;
  readonly attempts: number;
}

export class EventBus {
  private readonly handlers = new Map<string, EventHandler[]>();
  private readonly deadLetters: DeadLetterEvent[] = [];
  private readonly maxRetries: number;
  private queue: Promise<void> = Promise.resolve();

  public constructor(options: EventBusOptions = {}) {
    this.maxRetries = options.maxRetries ?? 0;
  }

  public subscribe<TPayload>(type: string, handler: EventHandler<TPayload>): () => void {
    const handlers = this.handlers.get(type) ?? [];
    handlers.push(handler as EventHandler);
    this.handlers.set(type, handlers);

    return () => {
      this.handlers.set(
        type,
        (this.handlers.get(type) ?? []).filter((item) => item !== handler)
      );
    };
  }

  public publish<TPayload>(
    type: string,
    payload: TPayload,
    options: { readonly correlationId?: string } = {}
  ): Promise<PlatformEvent<TPayload>> {
    const event: PlatformEvent<TPayload> = {
      id: generateUUID(),
      type,
      payload,
      occurredAt: new Date(),
      ...(options.correlationId ? { correlationId: options.correlationId } : {})
    };

    this.queue = this.queue.then(() => this.dispatch(event));
    return this.queue.then(() => event);
  }

  public getDeadLetters(): readonly DeadLetterEvent[] {
    return this.deadLetters;
  }

  private async dispatch(event: PlatformEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) ?? [];
    for (const handler of handlers) {
      let attempts = 0;
      while (true) {
        try {
          attempts += 1;
          await handler(event);
          break;
        } catch (error) {
          if (attempts > this.maxRetries) {
            this.deadLetters.push({ event, error, failedAt: new Date(), attempts });
            break;
          }
        }
      }
    }
  }
}

export function createEventBus(options?: EventBusOptions): EventBus {
  return new EventBus(options);
}

export function assertEventType(event: PlatformEvent, expectedType: string): void {
  if (event.type !== expectedType) {
    throw new PlatformError({
      category: "events",
      code: "OCS-EVENT-TYPE",
      message: `Expected event type ${expectedType} but received ${event.type}`
    });
  }
}

// strongly typed platforms events definitions

export const DocumentEventTypes = {
  DOCUMENT_OPENED: "document.opened",
  DOCUMENT_CLOSED: "document.closed",
  DOCUMENT_SAVED: "document.saved",
  DOCUMENT_CHANGED: "document.changed",
  DOCUMENT_REVERTED: "document.reverted"
} as const;

export type DocumentEventType = (typeof DocumentEventTypes)[keyof typeof DocumentEventTypes];

export interface DocumentEventPayload {
  uri: string;
  version?: number;
  isDirty?: boolean;
  timestamp?: number;
}

export const WorkspaceEventTypes = {
  WORKSPACE_OPENED: "workspace.opened",
  WORKSPACE_CLOSED: "workspace.closed"
} as const;

export type WorkspaceEventType = (typeof WorkspaceEventTypes)[keyof typeof WorkspaceEventTypes];

export interface WorkspaceEventPayload {
  path: string;
  workspaceId: string;
  workspaceUri: string;
}

export const EditorEventTypes = {
  EDITOR_OPENED: "editor.opened",
  EDITOR_CLOSED: "editor.closed",
  EDITOR_ACTIVE_CHANGED: "editor.active-changed"
} as const;

export type EditorEventType = (typeof EditorEventTypes)[keyof typeof EditorEventTypes];

export interface EditorEventPayload {
  inputId: string;
  groupId: string;
}

export const ThemeEventTypes = {
  THEME_CHANGED: "theme.changed"
} as const;

export type ThemeEventType = (typeof ThemeEventTypes)[keyof typeof ThemeEventTypes];

export interface ThemeEventPayload {
  themeId: string;
}

export const NotificationEventTypes = {
  NOTIFICATION_CREATED: "notification.created",
  NOTIFICATION_UPDATED: "notification.updated",
  NOTIFICATION_DISMISSED: "notification.dismissed"
} as const;

export type NotificationEventType =
  (typeof NotificationEventTypes)[keyof typeof NotificationEventTypes];

export interface NotificationEventPayload {
  id: string;
  notification: any;
}

export const SessionEventTypes = {
  SESSION_MODIFIED: "session.modified"
} as const;

export type SessionEventType = (typeof SessionEventTypes)[keyof typeof SessionEventTypes];

export interface SessionEventPayload {
  workspaceId: string;
  snapshot: any;
}
