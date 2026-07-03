# package: @ocs/memory

This package implements local vector similarity search databases,SQLite preference tables, and agent conversation log memory.

---

## 1. Architecture

The Memory platform utilizes an embedded SQLite engine for relational metadata and HNSW (Hierarchical Navigable Small World) vector indexing for semantic similarity matches.

```
@ocs/memory/
├── src/
│   ├── database/                # Relational SQLite bindings
│   │     └── SqliteMemoryDb.ts
│   ├── vector/                  # Similarity search indexers
│   │     └── HnswVectorStore.ts
│   └── application/             # RAG retrieval coordinators
│         └── MemoryService.ts
```

---

## 2. Public API

- `MemoryService`
  - `storeMemory(text: string, metadata: Record<string, any>): Promise<void>`
  - `searchSemanticMemory(query: string, limit: number): Promise<MemoryItem[]>`
  - `clearCache(): Promise<void>`

---

## 3. Internal API

- `HnswVectorStore`: Memory-mapped vector index holding computed floating point array embeddings.
- `SqliteMemoryDb`: SQLite wrapper executing transactional SQL logs in Write-Ahead Logging (WAL) mode.

---

## 4. Dependencies

- `@ocs/common` (Leaf utilities)
- `@ocs/event-bus` (Event coordination)
- `@ocs/runtime-core` (Abstract process definitions)

---

## 5. Import Rules

- **Allowed Imports:** `@ocs/common`, `@ocs/event-bus`, `@ocs/runtime-core`.
- **Forbidden Imports:** Must never import from AI agents (`@ocs/agents`) or UI layout engines.

---

## 6. Lifecycle

- SQLite databases are opened on workspace load. Vector indexes are cached in memory and dumped to disk on window close.

---

## 7. Testing

- Run tests via `pnpm test`.
- Vector embeddings are mocked using random floating-point generators to verify ranking logic.

---

## 8. Example Usage

```typescript
import { MemoryService } from "@ocs/memory";
import { container } from "@ocs/common";

const memory = container.resolve<MemoryService>("MemoryService");
await memory.storeMemory("Quicksort splits array into pivots", { file: "sort.ts" });
const matches = await memory.searchSemanticMemory("quicksort algorithm", 2);
```
