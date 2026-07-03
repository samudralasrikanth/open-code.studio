# Interface Specification: Document

This document defines the strict engineering contract for the Document subsystem.

---

## 1. Responsibilities

- Manage the lifecycle of open text buffers in memory.
- Track dirty states (unsaved edits) and manage file write locks.
- Implement reference counting to prevent premature garbage collection of active files.
- Coordinate save and revert commands with the filesystem.

---

## 2. Lifetime & Ownership

- **Owner:** Managed via Dependency Injection (`container.register("IDocumentService", DocumentService)`).
- **Lifetime Scope:** Singleton per active window session.
- **Reference Counting:** Documents are created/cached on first open. A reference counter increments on each editor mount, and decrements on unmount. The document is evicted from cache only when the reference counter drops to `0` and the file is not dirty.

---

## 3. Threading & Concurrency Model

- **Single-Threaded Event Loop:** The service runs on Electron's Main process, but synchronizes with Renderer text models over IPC.
- **Typing Sync:** In-memory typing edits are debounced (300ms) from Renderer to Main to prevent IPC saturation.
- **Blur Sync:** On editor focus loss (blur), typing edits are synchronized immediately without debounce.

---

## 4. Cardinality & Implementations

- **Single Coordinator:** One active `DocumentService` instance manages the document cache.
- **Document Types:**
  - `TextDocument` (manages UTF-8 text buffers).
  - `BinaryDocument` (read-only base64 buffers for images/binaries).

---

## 5. Event Specifications

- **`onDocumentOpened`**
  - **Payload:** `{ uri: WorkspaceUri }`
- **`onDocumentClosed`**
  - **Payload:** `{ uri: WorkspaceUri }`
- **`onDocumentChanged`**
  - **Payload:** `{ uri: WorkspaceUri; isDirty: boolean }`
- **`onDocumentSaved`**
  - **Payload:** `{ uri: WorkspaceUri }`

---

## 6. Error & Failure Contracts

- **Error DTOs:**
  - `DocumentOpenError`: Failed to parse document content.
  - `DirtySaveConflictError`: Attempted to close a dirty file without user approval.
- **IPC Boundaries:** Main process intercepts raw `Error` objects and serializes them into sanitized `{ success: false, code: string, message: string }` DTOs before sending them to the Renderer process over Electron IPC.

---

## 7. Electron IPC & API Mapping

- **IPC Channels:**
  - `document:open` $\rightarrow$ `openDocument(uri)`
  - `document:close` $\rightarrow$ `closeDocument(uri)`
  - `document:update` $\rightarrow$ `updateDocumentText(uri, text)`
  - `document:save` $\rightarrow$ `saveDocument(uri)`

---

## 8. Performance Targets

- **Resolution Latency:** $<10\text{ms}$ to load an already cached document.
- **Switch Latency:** $<5\text{ms}$ when switching between active editor tabs.

---

## 9. Persistence & State

- State is held in-memory within the `DocumentCache`. Dirty state is serialized to a local session restore database on window close.

---

## 10. Required Test Scenarios

- **Unit Tests:** Verify reference counts increment and decrement correctly across multiple active editors.
- **Integration Tests:** Verify that closing an active editor tab with a dirty document prompts user saving options.
- **Concurrency Tests:** Concurrently update a document buffer from multiple mock inputs and assert state integrity.
