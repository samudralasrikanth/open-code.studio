# 08. Risk Register

This document registers the critical technical, architectural, and performance risks of Open-Code.Studio, along with their detection metrics and mitigation strategies.

---

## 1. Native Module & Compiler Risks

### Risk 1.1: `node-pty` compilation failures on target platforms

- **Likelihood:** High | **Impact:** Critical
- **Description:** Differences in OS compiler versions (e.g. MSBuild on Windows, Xcode CLI on macOS, GCC/Clang on Linux) cause local pnpm installation or CI build crashes due to C++ compilation errors.
- **Mitigation:**
  1. Mandate the use of prebuilt binaries (`prebuild-install`) where possible.
  2. Implement a fallback mode: If the native PTY module fails to load, gracefully degrade the terminal UI to show an error message and offer a remote SSH terminal connector instead.
  3. Include a robust environment pre-flight check in `packages/runtime` that checks for native tools before spawning.

### Risk 1.2: Node/Electron ABI version mismatch

- **Likelihood:** Medium | **Impact:** High
- **Description:** Upgrading Electron or Node.js versions without rebuilding native C++ dependencies causes immediate runtime crashes.
- **Mitigation:**
  1. Bind the `pnpm install` lifecycle script directly to `electron-rebuild`.
  2. Lock specific Electron and Node.js target API versions in the main monorepo `package.json`.

---

## 2. Performance & Memory Risks

### Risk 2.1: Memory growth from large vector RAG indexes

- **Likelihood:** High | **Impact:** High
- **Description:** Indexing massive directories or importing numerous external files grows the local vector and semantic memory database, leading to high memory footprint and CPU throttling.
- **Mitigation:**
  1. Enforce strict directory ignore rules by default (e.g., ignoring `.git`, `node_modules`, `dist`, `.next`).
  2. Implement an indexing cap: Limit workspace indexing to a configurable maximum size (e.g. 5,000 files) or file type list.
  3. Evict stale vector indices using an LRU strategy.

### Risk 2.2: AST search scaling issues on large monorepos

- **Likelihood:** High | **Impact:** Medium
- **Description:** Generating complete symbol graphs and dependency tables on monorepos with hundreds of thousands of symbols causes long blocking operations.
- **Mitigation:**
  1. Move tree-sitter AST parsing entirely to background worker threads.
  2. Implement incremental symbol scanning: Only parse files that have changed on disk, using the `FileWatcher` as a delta trigger.
  3. Restrict deep graph traversal to immediate dependencies by default.

---

## 3. AI & Agent Execution Risks

### Risk 3.1: LLM hallucination and bad edits from Coding Agent

- **Likelihood:** High | **Impact:** High
- **Description:** The Coding Agent generates syntactically invalid code, introduces security vulnerabilities, or deletes code buffers.
- **Mitigation:**
  1. AST Validation: Parse every generated block with tree-sitter before writing it to the workspace. If the parser detects syntax errors, reject the edit and return the compiler diagnostics to the LLM for self-correction.
  2. Execution Sandbox: Never run AI-generated commands, tests, or scripts inside the active workspace process. Spawning tests must be done inside sandboxed containers or restricted utility subprocesses.
  3. Revert Hooks: Maintain a virtual file buffer stack. The editor must allow users to revert any agent edit with a single click.

---

## 4. Operational & Network Risks

### Risk 4.1: Network disconnect locks out Enterprise SSO

- **Likelihood:** Medium | **Impact:** High
- **Description:** Zero-trust security requirements block developers when working in offline environments.
- **Mitigation:**
  1. Authenticated Offline Cache: Cache verified OAuth refresh tokens locally using platform security vaults (macOS Keychain, Windows Credential Manager).
  2. Fallback mode: Implement an offline grace period (e.g., 7 days) before requiring re-authentication.
