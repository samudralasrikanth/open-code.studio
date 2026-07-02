# @ocs/workspace

Workspace Management domain for Open-Code.Studio.

## Responsibilities

- Workspace lifecycle (open, close, reload, dispose)
- Workspace URI abstraction (`file://`, `ssh://`, `container://`, `cloud://`)
- Recent workspaces registry
- Workspace configuration (`.ocs/workspace.json`)
- File system abstraction (no direct `fs` calls outside `LocalFileSystem`)

## Architecture

```text
Application Layer  WorkspaceService, WorkspaceRegistry
Domain Layer       Workspace, WorkspaceUri, WorkspaceState, WorkspaceMetadata
Infrastructure     IFileSystem, LocalFileSystem, IStorageAdapter, JsonStorageAdapter
Events             WorkspaceEvents (workspace.opening, workspace.opened, workspace.closed, ...)
```

## Public API

```typescript
import { createWorkspaceService, WorkspaceUri } from "@ocs/workspace";
```

## Constraints

- Zero Electron imports. This package is pure Node.js platform-agnostic code.
- All file system access goes through `IFileSystem`, not `node:fs` directly.
- Opening a workspace validates context only. No file scanning or indexing.
