# Interface Specification: Memory

This document defines the strict engineering contract for the Memory subsystem.

---

## 1. Responsibilities

- Index workspace contents and user prompts into local vector representations.
- Perform semantic similarity searches across cached vector data.
- Persist structured logs and configuration settings into a local relational database.
- Manage memory classification, promotion, and eviction policies.

---

## 2. Lifetime & Ownership

- **Owner:** Managed via Dependency Injection (`container.register("IMemoryService", MemoryService)`).
- **Lifetime Scope:** Singleton per active window session.
- **Eviction Policies:** Managed via an LRU cache. Local vector databases dump index states to disk on application exit.

---

## 3. Threading & Concurrency Model

- **Non-blocking Operations:** Vector embedding generation and DB file writes are executed in background threads or offloaded to the LLM Gateway.
- **SQLite Concurrency:** SQLite is initialized in WAL (Write-Ahead Logging) mode to allow concurrent reads while a write lock is active.

---

## 4. Cardinality & Implementations

- **Single Coordinator:** One active `MemoryService` instance is bound to the mounted workspace.
- **Implementations:**
  - `LocalMemoryService` (spawns SQLite and WASM-based HNSW vector indices).
  - `MockMemoryService` (used in test suites to verify index calls).

---

## 5. Event Specifications

- **`onMemoryIndexed`**
  - **Payload:** `{ fileCount: number; duration: number }`
- **`onMemoryEvicted`**
  - **Payload:** `{ evictedItemIds: string[] }`

---

## 6. Error & Failure Contracts

- **Error DTOs:**
  - `VectorGenerationError`: Failed to compile text into vector embedding.
  - `DatabaseCorruptedError`: Local database schema mismatch or file read failure.
- **IPC Boundaries:** Main process intercepts raw `Error` objects and serializes them into sanitized `{ success: false, code: string, message: string }` DTOs before sending them to the Renderer process over Electron IPC.

---

## 7. Electron IPC & API Mapping

- **IPC Channels:**
  - `memory:index` $\rightarrow$ `indexWorkspace()`
  - `memory:query` $\rightarrow$ `searchMemory(query, limit)`

---

## 8. Performance Targets

- **Query Latency:** $<30\text{ms}$ for similarity searches over 10,000 vector records.
- **Database Write Overhead:** $<5\text{ms}$ per transaction.

---

## 9. Persistence & State

- Data is written directly to local SQLite files (`.db`) and vector index files (`.bin`) under the user's application configuration directory.

---

## 10. Required Test Scenarios

- **Unit Tests:** Verify similarity ranking order returns closest matches first.
- **Integration Tests:** Verify that vector storage recovers correctly from unexpected process terminations.
- **Database Tests:** Run concurrent write stress tests and verify that database read operations do not block.
