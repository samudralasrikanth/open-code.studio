# @ocs/workspace Changelog

## 0.1.0 — 2026-07-02

- Initial release: EPIC-0004 Workspace Management
- `WorkspaceService` — open, close, reload, dispose
- `WorkspaceRegistry` — recent workspaces (configurable max, auto-prune)
- `WorkspaceUri` — branded URI abstraction for local and future remote workspaces
- `WorkspaceState` — immutable state machine with `failed` state
- `WorkspaceConfiguration` — reads `.ocs/workspace.json`
- `IFileSystem` + `LocalFileSystem` — file system abstraction layer
