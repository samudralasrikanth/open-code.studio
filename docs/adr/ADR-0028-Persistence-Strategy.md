# ADR-0028 — Persistence Strategy

## Status

Accepted

## Date

2026-07-03

## Context

The platform requires durable storage for user settings, workspace configurations, session state history, episodic memory, AST symbols, code index metadata, and local vector embeddings.

## Decision

Establish a tiered persistence strategy mapping data types to specific engines:

1. **Relational & Structured Metadata (Settings, History, Workflows, Memory):** SQLite database managed via an abstract wrapper. SQLite is embedded, lightweight, and supports complex relational query logic.
2. **AST Symbols & Symbol Graph:** Stored in a local document format or index file inside the workspace `.ocs/` directory, serialized using a fast binary format (e.g., MessagePack) or SQLite.
3. **High-Dimensional Embeddings (Vector Store):** Local vector index file (using approximate nearest neighbors) serialized directly to disk, with index updates committed atomically.
4. **Application Logs:** Append-only structured logs written directly to standard rotation logs on disk.

## Consequences

- **Positive:** Fast access times, robust transaction support, and absolute local data ownership.
- **Negative:** Native database driver compilation required for multiple platforms.

## Alternatives Considered

- LocalStorage/IndexedDB in Main Process: Rejected due to size limits and lack of transaction safety.
