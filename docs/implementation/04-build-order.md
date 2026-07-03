# 04. Build Order

This document details the chronological package-by-package, module-by-module build order. It lays out the exact execution path from the core foundation up to advanced remote runtimes and agents.

---

## 1. Phase 1 Core: Developer Workbench (Packages: workspace, explorer, document, editor, runtime)

### Track A: Local I/O & Document State

```
packages/workspace/ (Workspace Management)
  └── src/core/ (Workspace Initialization)
        └── EPIC-0004: Workspace Management
              └── STORY-0004-001: Workspace mount logic and directory scanning.

packages/explorer/ (Explorer State)
  └── src/tree/ (File Tree Indexer)
        └── EPIC-0005: Explorer Platform
              └── STORY-0005-001: Directory watching and file state caching.

packages/document/ (Buffer state)
  └── src/cache/ (Document cache and Reference Counting)
        └── EPIC-0006: Document & Editor Platform
              └── STORY-0006-001: File resolution and dirty state management.

packages/editor/ (Layout manager)
  └── src/layout/ (View Split Management)
        └── EPIC-0006: Document & Editor Platform
              └── STORY-0006-002: Editor splitting, groups, and serialization.
```

### Track B: Local Shell & Terminals (Parallel Track)

```
packages/runtime/ (PTY & Process Spawning)
  └── src/terminal/ (PtyHost Manager)
        └── EPIC-0007: Terminal Integration
              ├── STORY-0007-001: PtyHost subprocess implementation (Isolated PTY).
              └── STORY-0007-002: node-pty wrapper and shell detection.
```

### Track C: Utilities & Core Features

```
packages/workspace/ (Git Module)
  └── src/git/ (Git CLI bindings)
        └── EPIC-0008: Git Integration
              └── STORY-0008-001: Stage, unstage, commit, and diff parser.

packages/workspace/ (Search Module)
  └── src/search/ (Ripgrep executor)
        └── EPIC-0010: Global Search
              └── STORY-0010-001: Ripgrep execution and matching highlights.

packages/configuration/ (Global configuration)
  └── src/settings/ (Settings DB)
        └── EPIC-0011: Settings
              └── STORY-0011-001: JSON validation schema & user config DB.
```

---

## 2. Phase 2 & 3: Local AI Runtime & Gateway (Packages: runtime, gateway)

### Track A: Runtime Services

```
packages/runtime/ (Process execution)
  └── src/processes/ (Process isolation & diagnostics)
        ├── EPIC-0016: Runtime Service -> Spawning compilers and runtime binaries.
        ├── EPIC-0017: Model Registry -> Tracking local LLM availability.
        └── EPIC-0023: Token Engine
              ├── STORY-0023-001: WebWorker-offloaded tiktoken calculator (offline).
              └── STORY-0023-002: Prompt budget validator.
```

### Track B: Gateway Core (LLM Interface)

```
packages/gateway/ (AI Routing Engine)
  └── src/routing/ (Provider client bindings)
        ├── EPIC-0025: Gateway Core -> Base controller, fallback routes, retries.
        ├── EPIC-0026: Provider SDK -> Abstract provider schemas.
        ├── EPIC-0027: Local Provider -> Integration with local Llama.cpp/Ollama.
        └── EPIC-0028: Cloud Provider -> Integration with Gemini/OpenAI APIs.
```

---

## 3. Phase 4 & 5: Knowledge Engine & Memory (Packages: knowledge, memory)

```
packages/knowledge/ (AST parsing)
  └── src/parser/ (tree-sitter integration)
        ├── EPIC-0035: Workspace Scanner -> Batch file indexer.
        ├── EPIC-0037: Language Parsers -> AST parsing for TS, Python, Go.
        └── EPIC-0039: Dependency Graph -> Multi-file symbol graph mapping.

packages/memory/ (RAG Storage)
  └── src/database/ (SQLite & Vector Database)
        ├── EPIC-0044: Memory Store -> SQLite RAG database initialization.
        └── EPIC-0047: Memory Retrieval -> Multi-vector semantic search matching.
```

---

## 4. Phase 6 & 7: Agent Platform & Workflows (Packages: agents, workflow, sdk-agent)

```
packages/sdk-agent/ (Agent contracts)
  └── src/types/ (Abstract Agent contracts)
        └── EPIC-0049: Agent Registry -> Interface bindings for custom agents.

packages/agents/ (Agent implementation)
  └── src/subprocess/ (AgentHost execution)
        ├── EPIC-0050: Planner Agent -> Step planner and decomp engine.
        ├── EPIC-0051: Coding Agent
              ├── STORY-0051-001: AST edit application engine.
              └── STORY-0051-002: Compilation error validation/retry loop.
        └── EPIC-0052: Review Agent -> Static-analysis and lint checking.

packages/workflow/ (Pipeline execution)
  └── src/engine/ (Step execution loop)
        └── EPIC-0058: Workflow Core -> DAG task execution loop.
```

---

## 5. Phase 15: Platform Expansion & Runtimes (Apps: browser, cli, studio)

Following correct architectural sequencing to minimize API rework:

```
packages/runtime/ (Remote PTY / Runtime Host)
  └── src/remote/ (Server execution node)
        └── EPIC-0105: Remote Runtime
              └── STORY-0105-001: Headless runtime server, SSH tunnel support.

apps/studio/ (Public API Gateway)
  └── src/main/api/ (Public API interfaces)
        └── EPIC-0107: Public API
              └── STORY-0107-001: REST & WebSocket endpoints exposing IDE runtime capabilities.

apps/browser/ (Browser client)
  └── src/renderer/ (Vite compilation)
        └── EPIC-0103: Browser IDE
              └── STORY-0103-001: Web-only layout, browser-virtual FS, remote server sync.

apps/cli/ (CLI platform)
  └── src/cmd/ (CLI entry point)
        └── EPIC-0104: CLI
              └── STORY-0104-001: Command-line file opener & server client.

apps/studio/ (Mobile view wrapper)
  └── src/mobile/ (Cordova/Capacitor build)
        └── EPIC-0106: Mobile Companion
              └── STORY-0106-001: Tablet view layouts & presence monitoring client.
```
