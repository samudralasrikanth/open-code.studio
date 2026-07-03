# 09. Testing Strategy

This document establishes the testing architecture for Open-Code.Studio, defining the verification tiers, native module mock practices, and agent evaluation systems.

---

## 1. Multi-Tier Testing Architecture

```
                       +-----------------------------+
                       |   AI Eval & Golden Suites   |  <-- LLM validation,
                       |    (Regression testing)     |      hallucination tracking
                       +--------------+--------------+
                                      |
                       +--------------v--------------+
                       |      E2E UI Simulation      |  <-- Playwright / Spectron,
                       |    (Interactive flows)      |      renderer rendering
                       +--------------+--------------+
                                      |
                       +--------------v--------------+
                       |   IPC Integration Testing   |  <-- IPC contract validation,
                       |    (Renderer-to-Main)       |      events & commands
                       +--------------+--------------+
                                      |
                       +--------------v--------------+
                       |      Core Unit Testing      |  <-- Vitest, isolated mock APIs,
                       |  (90% coverage threshold)   |      fast execution
                       +-----------------------------+
```

### A. Core Unit Testing (Vitest)

- **Target:** Individual domain logic, event dispatchers, caching rules, and configuration validation.
- **Goal:** Maintain >90% coverage for core platforms (`packages/document`, `packages/editor`, `packages/runtime`, `packages/gateway`).

### B. IPC Integration Testing

- **Target:** Bridges between Electron Renderer React UI and Electron Main process handlers.
- **Execution:** Test runners spawn virtual main process IPC mocks that assert payload structures and verify error propagation (e.g. invalid file paths are caught before file I/O).

### C. E2E UI Simulation (Playwright)

- **Target:** Visual layouts, xterm mounting, split viewport rendering, and shortcut executions.
- **Execution:** Playwright launches the compiled Electron app, verifying that tabs, sidebars, and panels mount and update properly.

---

## 2. Mocking Native Modules in Node.js Test Environments

Native modules (e.g., `node-pty`, `better-sqlite3`) do not run reliably inside standard headless Node.js test environments. They must be mocked:

### Mocking `node-pty`

To test terminal services without spawning real shells, the test suite uses virtual PTY streams:

```typescript
// packages/runtime/tests/mocks/MockPty.ts
export class MockPty {
  private dataEmitter = new EventEmitter();

  write(data: string) {
    // Simulate terminal echo
    this.dataEmitter.emit("data", `Received: ${data}`);
  }

  onData(cb: (data: string) => void) {
    this.dataEmitter.on("data", cb);
    return { dispose: () => this.dataEmitter.off("data", cb) };
  }

  resize() {}
  kill() {}
}
```

### Mocking `tree-sitter`

Instead of compiling WASM or C binaries, AST queries are mocked with static tokens or virtual parse trees returning pre-defined syntax structures.

---

## 3. Testing Strategy for AI Agents & Prompts

AI Agents produce non-deterministic outputs that cannot be validated using standard assertion testing. The Agent Platform runs a dual-layer evaluation pipeline:

### A. Prompt Golden Suites

- **Definition:** Maintain a database of standard code tasks (e.g. "Add a health endpoint to a Express server", "Refactor this SQL query to use joins").
- **Verification:** The test runner runs the agent against these tasks and checks the output using static assertions:
  - Does the generated code compile?
  - Does it contain the expected syntax changes?
  - Did the unit tests of the target workspace pass after the edit?

### B. LLM-as-a-Judge Evaluation

- **Definition:** Use a separate LLM (e.g., Gemini Flash) to rate the generated edits.
- **Metrics Tracked:**
  - **Correctness:** Does the edit satisfy the task requirement?
  - **Syntax Compliance:** Does the file conform to project formatting rules?
  - **Hallucination Level:** Did the agent reference external packages or non-existent APIs?
