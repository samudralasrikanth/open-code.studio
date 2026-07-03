# Interface Specification: Knowledge

This document defines the strict engineering contract for the Knowledge subsystem.

---

## 1. Responsibilities

- Parse source code files into ASTs using tree-sitter.
- Extract code symbols (classes, functions, interfaces) and build a local symbol database.
- Construct cross-file dependency graphs mapping imports and calls.
- Track symbol reference ranges and update structural graphs incrementally.

---

## 2. Lifetime & Ownership

- **Owner:** Managed via Dependency Injection (`container.register("IKnowledgeService", KnowledgeService)`).
- **Lifetime Scope:** Singleton per active window session.
- **Eviction Policies:** Cached symbols are invalidated and re-scanned when files change on disk.

---

## 3. Threading & Concurrency Model

- **Worker Thread Isolation:** AST parsing and parsing graph generation run inside separate background Node.js worker threads (`ParserWorker`) to prevent UI event loop freezes.
- **Incremental Scans:** The watcher triggers incremental parsing of modified files rather than re-scanning the entire workspace.

---

## 4. Cardinality & Implementations

- **Single Coordinator:** One active `KnowledgeService` is bound to the workspace session.

---

## 5. Event Specifications

- **`onSymbolExtracted`**
  - **Payload:** `{ uri: WorkspaceUri; symbols: ExtractedSymbol[] }`
- **`onGraphUpdated`**
  - **Payload:** `{ nodeCount: number; edgeCount: number }`

---

## 6. Error & Failure Contracts

- **Error DTOs:**
  - `ParserCompilationError`: Parser language bindings fail to compile or load.
  - `AstQueryTimeoutError`: Code structure parsing exceeds allocated timeout.
- **IPC Boundaries:** Main process intercepts raw `Error` objects and serializes them into sanitized `{ success: false, code: string, message: string }` DTOs before sending them to the Renderer process over Electron IPC.

---

## 7. Electron IPC & API Mapping

- **IPC Channels:**
  - `knowledge:symbols` $\rightarrow$ `getWorkspaceSymbols()`
  - `knowledge:symbol-details` $\rightarrow$ `getSymbolDetails(symbolId)`
  - `knowledge:dependencies` $\rightarrow$ `getDependencyGraph()`

---

## 8. Performance Targets

- **Parsing Latency:** $<20\text{ms}$ to parse a 1,000-line source file.
- **Graph Compilation:** $<500\text{ms}$ to compile dependency relations for 500 files.

---

## 9. Persistence & State

- Symbol indexes and dependency graphs are cached in-memory and serialized to local binary caches to speed up workspace load times.

---

## 10. Required Test Scenarios

- **Unit Tests:** Verify correct symbol extraction for nested classes and functions.
- **Integration Tests:** Build dependency graphs for mock multi-file imports and verify call edge resolutions.
- **Incremental Tests:** Modify a mock import and assert that only the changed file and its direct dependents are re-parsed.
