import { describe, expect, it } from "vitest";

import { createEventBus } from "../../events/src/index.js";
import { createMetricRegistry } from "../src/index.js";

describe("MetricRegistry", () => {
  it("records counters, gauges, timers, and publishes metric events", async () => {
    const events = createEventBus();
    const published: string[] = [];
    events.subscribe("telemetry.metric.recorded", (event) => published.push(event.type));
    const metrics = createMetricRegistry(events);

    await metrics.increment("requests");
    await metrics.gauge("memory", 42);
    await metrics.time("operation", () => "done");

    expect(metrics.get("requests")?.value).toBe(1);
    expect(metrics.get("memory")?.value).toBe(42);
    expect(metrics.get("operation")?.type).toBe("timer");
    expect(published).toHaveLength(3);
    expect(metrics.snapshot()).toHaveLength(3);
  });
});
