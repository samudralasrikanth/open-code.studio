// use global performance object

import type { EventBus } from "../../events/src/index.js";

export interface Metric {
  readonly name: string;
  readonly type: "counter" | "gauge" | "timer";
  readonly value: number;
}

export class MetricRegistry {
  private readonly metrics = new Map<string, Metric>();

  public constructor(private readonly events?: EventBus) {}

  public async increment(name: string, amount = 1): Promise<void> {
    const current = this.metrics.get(name)?.value ?? 0;
    await this.setMetric({ name, type: "counter", value: current + amount });
  }

  public async gauge(name: string, value: number): Promise<void> {
    await this.setMetric({ name, type: "gauge", value });
  }

  public async time<T>(name: string, operation: () => T | Promise<T>): Promise<T> {
    const perf = typeof performance !== "undefined" ? performance : Date;
    const started = perf.now();
    try {
      return await operation();
    } finally {
      await this.setMetric({ name, type: "timer", value: perf.now() - started });
    }
  }

  public get(name: string): Metric | undefined {
    return this.metrics.get(name);
  }

  public snapshot(): readonly Metric[] {
    return [...this.metrics.values()];
  }

  private async setMetric(metric: Metric): Promise<void> {
    this.metrics.set(metric.name, metric);
    await this.events?.publish("telemetry.metric.recorded", metric);
  }
}

export function createMetricRegistry(events?: EventBus): MetricRegistry {
  return new MetricRegistry(events);
}
