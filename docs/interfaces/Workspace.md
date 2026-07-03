# Interface Specification: Workspace

This document defines the strict engineering contract for the Workspace subsystem.

---

## 1. Responsibilities

- Mount local directories into virtual workspaces.
- Search files asynchronously via globs and ignore filters.
- Read/write file buffers within workspace boundaries.
- Track directory structural modifications and emit lifecycle changes.

---

## 2. Lifetime & Ownership

- **Owner:** Managed via Dependency Injection (`container.register("IWorkspaceService", WorkspaceService)`).
- **Lifetime Scope:** Singleton per active window session.
- **Initialization:** Synchronous constructor; asynchronous `initialize(rootUri: WorkspaceUri): Promise<void>`.
- **Termination:** Clears file system listeners and unsubscribes from OS watcher daemons on window unload/shutdown.

---

## 3. Threading & Concurrency Model

- **Thread Safety:** Node.js file system APIs are offloaded to libuv background thread pools.
- **Non-blocking read/writes:** File I/O must never use synchronous methods (e.g. use `fs.promises.readFile`, not `fs.readFileSync`).
- **Concurrent Writes:** Writes to the same file are queued sequentially in memory to prevent write collision corruption.

---

## 4. Cardinality & Implementations

- **Single Instance:** Only one workspace can be mounted active per Electron window.
- **Multiple Implementations Permitted?** Yes:
  1. `LocalWorkspaceService` (spawns Node.js file system APIs in desktop app).
  2. `VirtualWorkspaceService` (used in tests and browser environments utilizing virtual mem-FS).

---

## 5. Event Specifications

- **`onWorkspaceChanged`**
  - **Emitted when:** Files/directories are added, modified, or deleted on disk.
  - **Payload:** `{ type: "added" | "changed" | "deleted"; uri: WorkspaceUri }`
- **`onWorkspaceMounted`**
  - **Emitted when:** A workspace root is successfully resolved and initialized.
  - **Payload:** `{ rootUri: WorkspaceUri }`

---

## 6. Error & Failure Contracts

- **Error DTOs:** Methods return rejected Promises throwing standard typed errors:
  - `WorkspaceNotFoundError`: Mount path does not exist.
  - `AccessDeniedError`: File write outside workspace bounds.
  - `FileLockedError`: File locked by another process.
- **IPC Boundaries:** Main process intercepts raw `Error` objects and serializes them into sanitized `{ success: false, code: string, message: string }` DTOs before sending them to the Renderer process over Electron IPC.

---

## 7. Electron IPC & API Mapping

- **IPC Channels (Main Process Listeners):**
  - `workspace:mount` $\rightarrow$ `initialize(rootUri)`
  - `workspace:read` $\rightarrow$ `readFile(uri)`
  - `workspace:write` $\rightarrow$ `writeFile(uri, content)`
  - `workspace:find` $\rightarrow$ `findFiles(globPattern, ignorePattern)`

---

## 8. Performance Targets

- **Mount Time:** $<50\text{ms}$ to load workspace tree structure for folders containing up to 10,000 files.
- **Search Latency:** $<150\text{ms}$ for complex globs over a 5,000-file repository.

---

## 9. Persistence & State

- Caches workspace metadata, file paths, and ignores in local session memory. No dirty file content buffers are stored in this service (delegated to `IDocumentService`).

---

## 10. Required Test Scenarios

- **Unit Tests:** Verify glob matching ignores `.git` and `node_modules` folders by default.
- **Integration Tests:** Mount mock workspaces containing 10,000 generated nested files and verify mount latency remains within target bounds.
- **Security Tests:** Attempt to read/write outside the workspace directory boundaries and assert that `AccessDeniedError` is thrown.
