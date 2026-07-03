# package: @ocs/telemetry

This package handles instrumentation collection, OpenTelemetry logs/metrics exporters, and tracing configurations.

---

## 1. Architecture

The Telemetry package provides lightweight wrappers that capture performance metrics, exception traces, and execution spans without leaking memory or blocking threads.

```
@ocs/telemetry/
├── src/
│   ├── application/             # Metric recorders
│   │     ├── Tracer.ts
│   │     └── MetricRegistry.ts
│   └── infrastructure/          # Exporters
│         ├── ConsoleExporter.ts
│         └── OtlpExporter.ts
```

---

## 2. Public API

- `Tracer`
  - `startSpan(name: string): ISpan`
  - `recordException(error: Error): void`
- `MetricRegistry`
  - `counter(name: string): ICounter`
  - `histogram(name: string): IHistogram`

---

## 3. Internal API

- `OtlpExporter`: Buffers traces and metrics, exporting them in batches to the telemetry daemon.
- `PerformanceMonitor`: Hooks into v8 runtime heap and CPU allocation trackers.

---

## 4. Dependencies

- None (Leaf package)

---

## 5. Import Rules

- **Allowed Imports:** Only local domain entities.
- **Forbidden Imports:** Must never depend on any other monorepo package.

---

## 6. Lifecycle

- Initialized first on application boot. Flushes queued buffers on application exit.

---

## 7. Testing

- Run tests via `pnpm test`.
- Uses mock console exporters to verify spans and metrics are registered correctly.

---

## 8. Example Usage

```typescript
import { Tracer } from "@ocs/telemetry";

const span = Tracer.startSpan("workspace.scan");
try {
  await scanWorkspace();
} catch (e) {
  Tracer.recordException(e);
} finally {
  span.end();
}
```
