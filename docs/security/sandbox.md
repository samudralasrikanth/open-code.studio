# Security: Process Sandboxing

This document outlines the sandboxing models for executing third-party code and AI agent tasks.

---

## 1. Plugin Execution Sandbox

- **Model:** Plugins execute inside isolated Node.js threads running in clean sandboxed environments.
- **Restrictions:**
  - Plugs cannot import native Node `fs`, `child_process`, or `net` modules directly.
  - Access to workspace I/O is restricted to the proxy APIs exposed by the `PluginHost` context interface.
  - All communication between the sandbox and the IDE main process is carried out over JSON-RPC protocols via isolated standard streams.

---

## 2. AI Agent Sandbox (Agent Host Process)

- **Subprocess Isolation:** The Planner and Coder agents execute tasks inside isolated utility processes.
- **Tool Sandbox:** Tools (e.g. running compilers, creating test servers) must be declared in the tool registry.
- **Resource Constraints:** Utility processes run with restricted memory (max: 1GB) and execution time limits (max: 2 minutes per task step) to prevent resource hogging or endless execution loops.
