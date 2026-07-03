# Performance Architecture

> Version: 1.0

## Goals

- Fast startup
- Responsive UI
- Low memory
- Efficient indexing

## Strategy

- Lazy loading
- Virtualization
- Background workers
- Incremental indexing
- Streaming AI responses

## Budgets

| Metric      | Target |
| ----------- | -----: |
| Startup     |    <2s |
| Editor open | <300ms |
| Command     | <100ms |

## Measurement

Track startup, memory, CPU, extension activation, AI latency and search performance.

## Optimization Rules

Measure first, optimize algorithms before micro-optimizations, avoid blocking the UI thread.

## Summary

Performance is continuously measured and enforced through architectural budgets and profiling.
