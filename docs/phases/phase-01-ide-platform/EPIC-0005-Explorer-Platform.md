# EPIC-0005 — Explorer Platform

| Property           | Value                                |
| ------------------ | ------------------------------------ |
| Epic ID            | EPIC-0005                            |
| Phase              | Phase 1 – IDE Platform               |
| Status             | ✅ Completed                         |
| Priority           | Critical                             |
| Estimated Duration | 3 Weeks                              |
| Dependencies       | EPIC-0004 Workspace Management       |
| Blocks             | EPIC-0006 Document & Editor Platform |

---

# Overview

The Explorer Platform provides the primary navigation experience for Open-Code.Studio by exposing the contents of the active workspace through a scalable, event-driven, virtualized tree.

Unlike traditional implementations where the UI owns the file tree, Open-Code.Studio treats the Explorer as a platform service.

The React UI is simply one consumer of the Explorer Platform.

Explorer owns:

- Virtual File System
- Tree Model
- Selection
- Expansion
- Decorations
- File Watching
- Tree Synchronization
- Explorer Commands
- Diagnostics

It does **not** own:

- Workspace lifecycle
- Document editing
- Git
- Search
- AI indexing

---

# Vision

Create an Explorer capable of handling projects containing hundreds of thousands of files while remaining responsive, extensible and completely independent of Electron and React.

Future consumers include:

- Desktop IDE
- Browser IDE
- CLI
- AI Agents
- Remote Explorer
- Enterprise Workspace Browser

---

# Objectives

## Functional

- Display workspace tree
- Expand/collapse folders
- Select files
- Refresh tree
- Watch filesystem changes
- Ignore system files
- Support decorations
- File operations
- Context menus
- Diagnostics

## Non-Functional

- Handle 100,000+ files
- Initial tree load <100ms (excluding disk IO)
- Virtualized rendering
- Event driven
- Immutable tree updates
- Platform independent
- Electron independent

---

# Scope

Included

- Virtual File System
- Tree Model
- Expansion Model
- Selection Model
- File Watcher
- Explorer Service
- Decorations
- Explorer Commands
- Diagnostics
- Provider Architecture

Excluded

- Document Editing
- Search
- Git Decorations
- AI Symbols
- Language Parsing

---

# Architecture

```
Workspace

↓

Explorer Provider

↓

Explorer Service

↓

Tree Model

↓

Visible Nodes

↓

Renderer

↓

Virtualized Tree
```

Explorer never depends directly on Electron.

---

# Package Structure

```
packages/explorer/

api/

application/
    ExplorerService
    ExplorerScheduler
    FileOperations
    FileWatcher

domain/
    ExplorerNode
    TreeModel
    ExpansionModel
    SelectionModel
    DecorationRegistry
    ExplorerIgnoreService

events/
    ExplorerEvents

infrastructure/
    LocalVirtualFileSystem
    NodeWatcher
```

---

# Core Components

## Explorer Service

Central orchestrator.

Responsibilities

- Load tree
- Refresh
- Expand
- Collapse
- Select
- Notify renderer
- Register providers

Everything routes through ExplorerService.

---

## Virtual File System

Current implementation

```
LocalVirtualFileSystem
```

Responsibilities

- Read directories
- Read metadata
- Normalize paths
- Ignore system files
- Resolve symlinks

Future

- Remote VFS
- GitHub VFS
- S3
- SSH
- Dev Containers

---

## Explorer Provider

Provides tree data.

Current

```
WorkspaceProvider
```

Future providers

- Favorites
- Git Changes
- Remote Explorer
- AI Context
- Bookmarks
- Search Results

Explorer supports multiple providers simultaneously.

---

## Tree Model

Owns the canonical tree.

Responsibilities

- Immutable updates
- Flatten tree
- Visible nodes
- Parent relationships
- Child ordering

The renderer never manipulates the tree directly.

---

## Selection Model

Responsibilities

- Selected node
- Multi-selection (future)
- Keyboard navigation

Future

- Multi-select
- Range selection

---

## Expansion Model

Responsibilities

- Expanded folders
- Collapse all
- Restore state

Expansion state survives refreshes.

---

## Decoration Registry

Supports decorations contributed by other platforms.

Current

Placeholder implementation.

Future providers

- Git
- Diagnostics
- AI
- Tests
- Breakpoints
- Bookmarks

Each provider contributes decorations independently.

---

## Explorer Scheduler

Buffers expensive updates.

Responsibilities

- Batch filesystem events
- Debounce refreshes
- Prevent tree rebuild storms

Example

```
100 filesystem events

↓

Scheduler

↓

1 Tree Refresh
```

---

## File Watcher

Current implementation

```
@parcel/watcher
```

Responsibilities

- Watch workspace
- Detect creates
- Detect deletes
- Detect renames
- Detect modifications

Ignored

```
.git

.DS_Store

Thumbs.db

__MACOSX
```

---

## Explorer Ignore Service

Central ignore engine.

Current defaults

```
.git

.DS_Store

Thumbs.db

__MACOSX
```

Future

- .gitignore
- .ignore
- Workspace ignore rules

---

# Data Model

ExplorerNode

```
id

uri

name

type

depth

parent

children

expanded

selected

decorations
```

VisibleNode

```
node

depth

visibleIndex
```

---

# IPC Contracts

Renderer

```
window.ocs.explorer

getTree()

refresh()

expand()

collapse()

select()

subscribe()
```

Main

```
explorer:get-tree

explorer:refresh

explorer:expand

explorer:collapse

explorer:select
```

---

# Events

Published

```
explorer.loaded

explorer.refreshed

explorer.nodeExpanded

explorer.nodeCollapsed

explorer.selectionChanged

explorer.fileCreated

explorer.fileDeleted

explorer.fileRenamed
```

Consumers

- Editor
- Git
- Search
- AI
- Diagnostics

---

# Commands

Current

```
explorer.refresh

explorer.expand

explorer.collapse

explorer.select
```

Future

```
explorer.newFile

explorer.newFolder

explorer.rename

explorer.delete

explorer.move

explorer.copy

explorer.reveal
```

---

# Renderer

Components

```
Workbench

Sidebar

ExplorerPanel

FileTree

DeveloperDiagnosticsPanel
```

Hooks

```
useExplorer()
```

Virtualization

```
@tanstack/react-virtual
```

---

# Performance Targets

| Metric            | Target              |
| ----------------- | ------------------- |
| Initial Load      | <100ms (tree build) |
| Expand Folder     | <16ms               |
| Collapse Folder   | <16ms               |
| Refresh           | <100ms              |
| Visible Rendering | 60 FPS              |
| Supported Files   | 100,000+            |

---

# Stories

## STORY-0008

Virtual File System

Tasks

- Read directories
- Normalize paths
- Ignore files

---

## STORY-0009

Tree Model

Tasks

- Immutable tree
- Flattening
- Visible nodes

---

## STORY-0010

Explorer Service

Tasks

- Load
- Refresh
- Selection
- Expansion

---

## STORY-0011

File Watcher

Tasks

- Watch workspace
- Debounce
- Refresh

---

## STORY-0012

Provider Architecture

Tasks

- Workspace Provider
- Registry
- Decorations

---

## STORY-0013

Renderer

Tasks

- Virtualized tree
- Sidebar
- Toolbar
- Diagnostics

---

## STORY-0014

Explorer Scheduler

Tasks

- Batch updates
- Queue refreshes
- Event throttling

---

# Complete Task Checklist

## Domain

- [x] ExplorerNode
- [x] TreeModel
- [x] ExpansionModel
- [x] SelectionModel

## Application

- [x] ExplorerService
- [x] Scheduler
- [x] FileOperations

## Infrastructure

- [x] Virtual File System
- [x] File Watcher
- [x] Ignore Service

## UI

- [x] ExplorerPanel
- [x] Virtualized Tree
- [x] Sidebar
- [x] Toolbar

## Diagnostics

- [x] Developer Panel
- [x] Explorer Metrics

---

# Manual Verification

✓ Open workspace

✓ Explorer loads

✓ Expand folders

✓ Collapse folders

✓ Select file

✓ Refresh explorer

✓ External filesystem change updates tree

✓ Sidebar resize persists

✓ System files hidden

✓ Diagnostics update

---

# Automated Verification

```bash
pnpm --filter @ocs/explorer test

pnpm validate

pnpm lint

pnpm typecheck
```

Coverage Target

```
>=90%
```

Benchmarks

```
large-tree.bench.ts

watcher.bench.ts

flatten.bench.ts
```

---

# Acceptance Criteria

Explorer Platform is complete when:

- Workspace contents display correctly.
- Tree virtualization supports very large workspaces.
- File watching updates the tree automatically.
- Explorer remains independent of Electron and React.
- Providers can contribute nodes and decorations.
- Performance targets are met.

---

# Risks

| Risk                        | Mitigation                   |
| --------------------------- | ---------------------------- |
| Large workspace performance | Virtualization + Scheduler   |
| Watcher event storms        | Debouncing                   |
| Platform coupling           | Provider architecture        |
| Tree inconsistencies        | Immutable TreeModel          |
| Future extensibility        | ExplorerProvider abstraction |

---

# Future Enhancements

EPIC-0008

Git Decorations

EPIC-0010

Search Results Provider

Phase 4

AI Symbol Explorer

Phase 6

Agent Explorer

Phase 10

Enterprise Explorer

---

# Deliverables

- Explorer Platform
- Virtual File System
- Tree Model
- Selection & Expansion Models
- Explorer Scheduler
- File Watcher
- Provider Architecture
- Virtualized Renderer
- Diagnostics

---

# Epic Completion Summary

**Status:** ✅ Completed

**Outcome**

Open-Code.Studio now has a scalable Explorer Platform capable of supporting very large workspaces through immutable tree models, virtualized rendering, provider-based extensibility, and event-driven synchronization. The platform is independent of both Electron and React, making it reusable across future desktop, browser, and remote IDE implementations.

---

# Changelog

## v1.0.0

- Introduced Explorer Platform.
- Implemented Virtual File System.
- Added immutable Tree Model.
- Added File Watcher and Scheduler.
- Introduced Provider Architecture.
- Added virtualized Explorer renderer.
- Added diagnostics and performance benchmarks.
