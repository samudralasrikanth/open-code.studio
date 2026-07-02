import { randomUUID } from "node:crypto";

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
      id: randomUUID(),
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
