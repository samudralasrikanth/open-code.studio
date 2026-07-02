import { describe, expect, it } from "vitest";

import { assertEventType, createEventBus } from "../src/index.js";

describe("EventBus", () => {
  it("publishes events to async subscribers in order", async () => {
    const events = createEventBus();
    const received: number[] = [];
    events.subscribe<number>("number", (event) => {
      received.push(event.payload);
    });

    await Promise.all([events.publish("number", 1), events.publish("number", 2)]);

    expect(received).toEqual([1, 2]);
  });

  it("stores failed handlers in the dead-letter queue", async () => {
    const events = createEventBus({ maxRetries: 1 });
    events.subscribe("fails", () => {
      throw new Error("handler failed");
    });

    await events.publish("fails", { ok: false }, { correlationId: "corr-1" });

    expect(events.getDeadLetters()).toHaveLength(1);
    expect(events.getDeadLetters()[0]?.attempts).toBe(2);
    expect(events.getDeadLetters()[0]?.event.correlationId).toBe("corr-1");
  });

  it("supports unsubscribe, no-handler publishes, and event type assertions", async () => {
    const events = createEventBus();
    let count = 0;
    const unsubscribe = events.subscribe("count", () => {
      count += 1;
    });

    const event = await events.publish("count", null);
    unsubscribe();
    await events.publish("count", null);
    await events.publish("no.handlers", null);

    assertEventType(event, "count");
    expect(() => assertEventType(event, "other")).toThrow(/Expected event type/);
    expect(count).toBe(1);
  });
});
