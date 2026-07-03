# Security: Process Model

This document maps the Electron multi-process topology of Open-Code.Studio.

---

## 1. Process Hierarchy

To isolate CPU-heavy operations and avoid UI freezes, the application distributes execution across multiple dedicated OS processes:

```
[ Electron Main Process ] (Orchestrator / Composition Root)
       ├── [ Renderer Process (React UI Window) ]
       │         └── [ Monaco Web Workers (Syntax, Tokenizer) ]
       │
       ├── [ PtyHost Utility Process ] (node-pty spawning)
       │         ├── [ Local Shell Process (zsh/bash) ]
       │         └── [ Local Shell Process (cmd/pwsh) ]
       │
       ├── [ AgentHost Utility Process ] (AI orchestration)
       │         └── [ Task Execution Sandbox ]
       │
       └── [ Extension Host Subprocess ] (Third-party plugins)
```

---

## 2. Process Responsibilities

### Electron Main Process

- **Context:** Node.js + Electron Core.
- **Role:** Handles application bootstrapping, window lifecycle management, menu rendering, native file dialogues, and IPC routing.

### Renderer Process

- **Context:** Chromium Browser context.
- **Role:** Renders React UI elements, mounts Monaco editor adapters, and captures user shortcut key events. No native Node modules are loaded here.

### PtyHost Utility Process

- **Context:** Isolated Node.js environment.
- **Role:** Loads native `node-pty` modules and coordinates standard I/O streams between shells and xterm.js in the Renderer process.
