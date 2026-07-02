# @ocs/workspace — Engineering Documentation

See the [package README](../README.md) for usage and architecture overview.

## Design Decisions

See [docs/ARCHITECTURE_DECISIONS.md](../../../docs/ARCHITECTURE_DECISIONS.md) for ADR-013 (WorkspaceUri) and the rationale for the FileSystemService abstraction.

## State Machine

```text
         ┌──────────────────────────────┐
         │           closed             │◄──────────────┐
         └──────────────┬───────────────┘               │
                        │ open()                         │ close()
         ┌──────────────▼───────────────┐               │
         │           opening            │               │
         └──────────────┬───────────────┘               │
                        │                               │
           ┌────────────┴────────────┐                  │
           │ success                 │ error             │
┌──────────▼──────────┐  ┌──────────▼──────────┐       │
│        open         │  │       failed         │       │
└──────────┬──────────┘  └─────────────────────┘       │
           │                                            │
           └────────────────────────────────────────────┘
```

## Event Sequence

```text
workspace.opening  → validation begins
workspace.opened   → workspace is ready
workspace.closed   → workspace released
workspace.failed   → open attempt failed
workspace.state-changed → any state transition
workspace.recent-updated → recent list changed
```
