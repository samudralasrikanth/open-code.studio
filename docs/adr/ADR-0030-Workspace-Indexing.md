# ADR-0030 — Workspace Indexing Strategy

## Status

Accepted

## Date

2026-07-03

## Context

AI agents need up-to-date codebase context (AST symbols, import graphs, and natural language search). Scanning and parsing a large workspace (e.g., 50,000 files) is resource-intensive and must be managed incrementally without locking the main thread.

## Decision

Implement an incremental, event-driven indexing pipeline:

1. **Watch Layer:** Uses an OS-level file watcher (e.g., `@parcel/watcher`) to emit file modification events.
2. **Filtering:** Ignores directories like `node_modules`, `.git`, and files matching user-defined `.gitignore` patterns immediately at the watcher level.
3. **Parse & Extraction (AST):** Spawns worker threads to parse modified files using an incremental parser, extracting class definitions, functions, imports, and symbol scopes.
4. **Vector Generation (Embeddings):** Modified symbol blocks and comments are queued, batched, and sent to the local embedding engine.
5. **Knowledge Store Commit:** Updates are committed atomically.

## Consequences

- **Positive:** Initial indexing runs once on cold startup; subsequent modifications trigger minimal incremental updates (completed in <500 ms).
- **Negative:** Increased complexity in maintaining a live symbol graph cache.
