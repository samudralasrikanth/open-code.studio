# package: @ocs/knowledge

This package handles tree-sitter AST parsing, code symbol extraction, workspace structural scanning, and dependency graph building.

---

## 1. Architecture

The Knowledge engine parses files incrementally using background worker processes, constructing an in-memory dependency graph of symbols.

```
@ocs/knowledge/
├── src/
│   ├── domain/                  # AST and Graph models
│   │     ├── CodeSymbol.ts
│   │     └── DependencyGraph.ts
│   ├── application/             # Symbol indexing services
│   │     ├── WorkspaceScanner.ts
│   │     └── SymbolExtractor.ts
│   └── workers/                 # Background threads
│         └── ParserWorker.ts
```

---

## 2. Public API

- `WorkspaceScanner`
  - `indexWorkspace(workspace: Workspace): Promise<void>`
- `SymbolExtractor`
  - `extractSymbols(uri: WorkspaceUri): Promise<CodeSymbol[]>`
- `DependencyGraph`
  - `resolveCallDependencies(symbolId: string): Promise<SymbolNode[]>`

---

## 3. Internal API

- `ParserWorker`: Background Node.js thread loading tree-sitter C/WASM modules.
- `SymbolIndexStore`: Local memory index of code locations and boundaries.

---

## 4. Dependencies

- `@ocs/common` (Leaf utilities)
- `@ocs/event-bus` (Event coordination)
- `@ocs/runtime-core` (Abstract process definitions)

---

## 5. Import Rules

- **Allowed Imports:** `@ocs/common`, `@ocs/event-bus`, `@ocs/runtime-core`.
- **Forbidden Imports:** Must never depend on LLM Gateway (`@ocs/gateway`) or agent executors (`@ocs/agents`).

---

## 6. Lifecycle

- Workspace scanning starts in the background on workspace mount. Parser worker threads are terminated on window close.

---

## 7. Testing

- Run tests via `pnpm test`.
- Uses mock code files to verify symbol extraction matches tree-sitter node bounds.

---

## 8. Example Usage

```typescript
import { SymbolExtractor } from "@ocs/knowledge";
import { container } from "@ocs/common";

const extractor = container.resolve<SymbolExtractor>("SymbolExtractor");
const symbols = await extractor.extractSymbols(fileUri);
console.log(`Found ${symbols.length} code symbols.`);
```
