# 06. Third-Party Libraries

This document catalogs the external libraries mandated for Open-Code.Studio, their architectural roles, target packages, and specific integration constraints (especially regarding native C++ bindings).

---

## 1. Core Dependency Catalog

| Library             | Role in Architecture                                     | Target Monorepo Package           | Build & Licensing Constraints                                                  |
| ------------------- | -------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------ |
| **Monaco Editor**   | Code editing UI viewport and syntax tokenizer adapter.   | `packages/editor-monaco`          | Browser-only ESM compilation; web-worker loading isolation.                    |
| **node-pty**        | Spawns and manages pseudoterminals as real OS processes. | `packages/runtime` (Pty Host)     | **Native Add-on**. Requires `electron-rebuild` and system compiler toolchains. |
| **tree-sitter**     | Inc-parsing and AST queries for semantic indexing.       | `packages/knowledge`              | **Native Add-on**. Needs prebuilt binaries or WASM compile target.             |
| **tiktoken** (WASM) | Tokenizer for OpenAI/Claude/Mistral BPE counting.        | `packages/runtime` (Token Engine) | WASM binding; runs offline inside Worker threads.                              |
| **Yjs**             | CRDT conflict resolution for collaborative sessions.     | `packages/common` (Collab)        | Pure JS; standard websocket communication bindings.                            |
| **better-sqlite3**  | Embedded SQL engine for metadata and agent logs.         | `packages/memory` (Store)         | **Native Add-on**. Requires local build targeting Electron ABI.                |
| **OpenTelemetry**   | Logs, metrics, and tracing instrumentation.              | `packages/telemetry`              | Pure JS; integrates with system daemon exporter.                               |

---

## 2. Integration & Native Compiling Guidelines

Three critical dependencies (`node-pty`, `tree-sitter`, and `better-sqlite3`) are native C++ Node modules. To prevent installation crashes, the following policies are enforced:

### A. Electron ABI Rebuilding

Electron uses a different V8 ABI than standard Node.js. Running `npm install` directly will cause runtime crashes (`NODE_MODULE_VERSION` mismatches).

- **Tooling:** All native modules must be rebuilt using `electron-rebuild` (integrated in the `pnpm install` lifecycle script).
- **Configuration:** Maintain an `.npmrc` pinning Electron header targets:
  ```ini
  target=19.0.0
  arch=x64
  target_arch=x64
  disturl=https://electronjs.org/headers
  runtime=electron
  build_from_source=true
  ```

### B. Sandboxing and Subprocesses (PTY Host)

Native modules must never be loaded in the Electron Renderer process.

- `node-pty` must be loaded exclusively inside a dedicated utility process (`PtyHost`) spawned by the Electron main process via `utilityProcess.fork()`.
- IPC bridges pass data streams between xterm.js (Renderer) and `node-pty` (Pty Host).

---

## 3. Library Selection Rationales

### Why Yjs over Automerge?

- **Performance:** Yjs exhibits significantly faster insertion, deletion, and search performance on large text buffers.
- **Ecosystem:** Rich integrations with editor systems exist, making integration with Monaco straightforward.

### Why direct WASM-tiktoken over LangChain?

- **Low Footprint:** Avoid loading a heavy framework (like LangChain) inside the desktop runtime.
- **Process Speed:** Native WASM execution allows counting 100k tokens in <50ms when isolated to Web Workers, meeting token latency limits.
