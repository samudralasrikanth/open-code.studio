# Performance: Budgets & Targets

This document establishes the resource budgets and response latency targets for Open-Code.Studio.

---

## 1. Latency Budgets

To maintain a fast, responsive IDE experience, services must meet these latency budgets:

| Operation             | Target Budget   | Measurement Method                               |
| --------------------- | --------------- | ------------------------------------------------ |
| **Tab Switch Time**   | $<5\text{ms}$   | Delta time from click to Monaco buffer mount.    |
| **Workspace Mount**   | $<100\text{ms}$ | Directory scanning and indexing for 5,000 files. |
| **Global Search**     | $<150\text{ms}$ | Ripgrep execution over a 2,000-file repository.  |
| **Pty Session Spawn** | $<120\text{ms}$ | Time from spawn command to PTY data response.    |
| **Token Count**       | $<50\text{ms}$  | Worker thread counting for 100k character text.  |

---

## 2. Memory Footprint Targets

- **Base Main Process:** $<120\text{MB}$ heap usage on startup.
- **Base Renderer Process:** $<150\text{MB}$ heap usage.
- **PtyHost Utility:** $<80\text{MB}$ heap usage.
- **AgentHost Sandbox:** $<200\text{MB}$ base memory overhead. Enforces a strict hard limit of $1\text{GB}$ maximum process RAM footprint.
