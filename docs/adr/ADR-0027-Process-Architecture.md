# ADR-0027 — Process Architecture

## Status

Accepted

## Date

2026-07-03

## Context

Open-Code.Studio is a desktop IDE built on Electron. Because it runs local model inference, indices large file codebases, executes autonomous coding agents, and hosts third-party extensions, a single-process architecture is unacceptable. A crash in an extension or an out-of-memory error during LLM execution must never crash the main IDE interface.

## Decision

Implement a multi-process architecture with strict process boundaries:

1. **Renderer Process (UI Host):** Standard Chromium rendering context. Hosts React, HTML/CSS layout, and the Monaco Editor UI. Has zero direct access to Node.js APIs or system resources.
2. **Main Process (Orchestrator):** Node.js context running as the Electron main thread. Manages window lifecycle, global menu states, Electron IPC channel registration, window configuration storage, and the central Event Bus routing.
3. **Runtime Process (Sidecar):** Dedicated native process/worker running local model execution, local tokenization, and model weight caching in memory.
4. **Knowledge Process (Worker):** Non-blocking worker process conducting file system scanning, AST extraction, symbol graph generation, and generating local text embeddings.
5. **Agent Host (Worker):** Isolated execution sandbox running the loop mechanisms of Planner, Coding, and Review agents. Exposes controlled tools (filesystem write, terminal execution) to the agents.
6. **Extension Host (Sandboxed Process):** Isolated node process executing third-party plugins. Bounded by strict permission checks.

```
[ Renderer UI ]
      │
 (Electron IPC)
      │
      ▼
 [ Main Process ] <───(Event Bus)───> [ Extension Host (Plugins) ]
      │
  ┌───┴───────────────┬───────────────────┐
  ▼                   ▼                   ▼
[ Runtime (LLM) ]  [ Knowledge (AST) ]  [ Agent Host (Loop) ]
```

## Consequences

- **Positive:** UI remains responsive (60fps) during heavy background LLM execution or large file indexing. Crashes in plugins or agents are isolated and recoverable.
- **Negative:** Increased IPC message serialization overhead. Memory footprint is higher due to multiple Node.js runtimes.

## Alternatives Considered

- Single-process with Worker Threads: Rejected because Worker Threads share the same v8 memory limit and can still crash the parent process on uncaught native errors.
