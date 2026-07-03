# Interface Specification: Runtime

This document defines the strict engineering contract for the Runtime subsystem.

---

## 1. Responsibilities

- Spawning and managing local shell runtimes (PTY processes).
- Executing process diagnostics (GPU capabilities detection, memory usage).
- Offloading tokenization computations to background threads (Web Workers).
- Running local execution environments (compilers, test runner CLI nodes).

---

## 2. Lifetime & Ownership

- **Owner:** Managed via Dependency Injection (`container.register("IRuntimeService", RuntimeService)`).
- **Lifetime Scope:** Singleton per active window session.
- **Process Isolation:** The terminal PTY processes must be spawned and executed inside a dedicated Electron utility subprocess (`PtyHost`) to isolate crash domains from the Main process.

---

## 3. Threading & Concurrency Model

- **PTY Execution:** Native `node-pty` processes are bound to OS execution hooks in their own subprocess, communicating asynchronously via IPC.
- **Token Engine Threading:** Tiktoken dictionary loading and BPE counting execute in separate Web Workers (`TokenizationWorkers`) to ensure zero event-loop blocking on main or renderer processes.

---

## 4. Cardinality & Implementations

- **Single Host Coordinator:** Only one main PtyHost subprocess is managed per Electron window.
- **PTY Sessions:** Multiple local shell sessions (Bash, Zsh, PowerShell) can run concurrently.

---

## 5. Event Specifications

- **`onPtyData`**
  - **Payload:** `{ sessionId: PtySessionId; data: string }`
- **`onPtyExit`**
  - **Payload:** `{ sessionId: PtySessionId; exitCode: number }`

---

## 6. Error & Failure Contracts

- **Error DTOs:**
  - `PtySpawnError`: Shell executable path not found or execution restricted.
  - `GpuDetectionError`: Local GPU discovery driver missing or failed.
- **IPC Boundaries:** Main process intercepts raw `Error` objects and serializes them into sanitized `{ success: false, code: string, message: string }` DTOs before sending them to the Renderer process over Electron IPC.

---

## 7. Electron IPC & API Mapping

- **IPC Channels:**
  - `runtime:spawn-pty` $\rightarrow$ `createSession(shell, cwd, cols, rows)`
  - `runtime:write-pty` $\rightarrow$ `write(sessionId, data)`
  - `runtime:resize-pty` $\rightarrow$ `resize(sessionId, cols, rows)`
  - `runtime:gpu-detect` $\rightarrow$ `detectGpu()`

---

## 8. Performance Targets

- **PTY Spawn Latency:** $<100\text{ms}$ to return process PID.
- **Token Count Latency:** $<50\text{ms}$ for input strings up to 100k tokens.

---

## 9. Persistence & State

- PTY history caches terminal buffer scrollback lines in local session files. Session states (shell configuration and active CWD) are persisted to allow restore on reload.

---

## 10. Required Test Scenarios

- **Unit Tests:** Mock token engine to verify context limits are enforced.
- **Integration Tests:** Verify native `node-pty` loading fallback on unsupported OS versions.
- **Security Tests:** Ensure shell processes spawned cannot escalate permissions beyond the user's OS privileges.
