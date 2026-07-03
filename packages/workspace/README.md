# package: @ocs/workspace

This package contains the Workspace platform domain logic, managing directories, workspace mounts, search executions, and Git version control integrations.

---

## 1. Architecture

The Workspace package is structured using domain-driven design, decoupling raw file-system access from workspace metadata.

```
@ocs/workspace/
├── src/
│   ├── domain/                  # Workspace entities & schemas
│   │     ├── Workspace.ts
│   │     └── WorkspaceUri.ts
│   ├── application/             # Workspace coordination services
│   │     ├── WorkspaceService.ts
│   │     └── GitService.ts
│   └── infrastructure/          # Low-level systems
│         ├── NodeFileSystem.ts
│         └── RipgrepSearch.ts
```

---

## 2. Public API

- `WorkspaceService`
  - `mount(path: string): Promise<Workspace>`
  - `findFiles(glob: string, ignore?: string): Promise<WorkspaceUri[]>`
  - `readFile(uri: WorkspaceUri): Promise<string>`
  - `writeFile(uri: WorkspaceUri, data: string): Promise<void>`
- `GitService`
  - `getDiff(uri: WorkspaceUri): Promise<GitDiff>`
  - `stage(uri: WorkspaceUri): Promise<void>`
  - `commit(message: string): Promise<void>`

---

## 3. Internal API

- `NodeFileSystem`: Low-level wrapper executing Node.js `fs/promises` calls.
- `RipgrepSearch`: Spawn utility that manages child process executions of `rg`.

---

## 4. Dependencies

- `@ocs/common` (Leaf utilities)
- `@ocs/event-bus` (Event coordination)
- `@ocs/telemetry` (Instrumentation metrics)

---

## 5. Import Rules

- **Allowed Imports:** Only leaf packages (`common`, `event-bus`, `telemetry`) and system config schemas.
- **Forbidden Imports:** Must never import from UI packages (`@ocs/ui`), editors (`@ocs/editor`), or application shells (`apps/studio`).

---

## 6. Lifecycle

- Mounted synchronously on application startup or when a folder is opened.
- Disposed on window unload: unsubscribes from OS file system watchers.

---

## 7. Testing

- Run unit tests via `pnpm test`.
- Uses mock filesystems (`MemFS`) to verify glob patterns and write validations without polluting the disk.

---

## 8. Example Usage

```typescript
import { WorkspaceService } from "@ocs/workspace";
import { container } from "@ocs/common";

const workspaceService = container.resolve<IWorkspaceService>("IWorkspaceService");
await workspaceService.mount("/path/to/project");
const files = await workspaceService.findFiles("**/*.ts");
```
