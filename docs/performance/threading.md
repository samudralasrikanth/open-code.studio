# Performance: Threading & Offloading

This document explains how Open-Code.Studio offloads CPU-heavy tasks to background processes and thread pools.

---

## 1. Main Process Offloading

- The Electron Main process coordinates system events and must never block.
- Any operation exceeding a budget of $10\text{ms}$ (such as directory scanning, symbol parsing, or token counting) must be offloaded to separate background threads or utility subprocesses.

---

## 2. Thread Pools & Utility Workers

### Node.js Worker Threads (`worker_threads`)

- Used for in-process parallelism.
- **Symbol Indexer:** Spawns a pool of WebAssembly-based tree-sitter worker threads. AST parsing runs on worker threads, returning JSON-serializable symbol nodes to the Main process.

### Electron Utility Processes (`utilityProcess`)

- Used for subprocess isolation.
- **PtyHost:** Spawns terminal execution. If a shell process goes haywire, only the PtyHost process crashes; the Main process remains active.
- **AgentHost:** Executes planning and coding loops in sandboxes.

### Web Workers (Renderer Process)

- Used for UI thread responsiveness.
- **Monaco Syntax Workers:** Dynamically tokenizes Monaco code editor buffers.
