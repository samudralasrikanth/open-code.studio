# EPIC-0004 — Workspace Management

| Property           | Value                       |
| ------------------ | --------------------------- |
| Epic ID            | EPIC-0004                   |
| Phase              | Phase 1 – IDE Platform      |
| Status             | ✅ Completed                |
| Priority           | Critical                    |
| Estimated Duration | 2 Weeks                     |
| Dependencies       | EPIC-0003 Desktop Bootstrap |
| Blocks             | EPIC-0005 Explorer Platform |

---

# Overview

Workspace Management introduces the concept of an active workspace into Open-Code.Studio.

A workspace represents the root context for all developer operations including file exploration, document editing, search, terminal sessions, Git operations, AI context, indexing, diagnostics, and future collaboration.

This platform intentionally owns only workspace lifecycle and persistence. It does **not** own file exploration or document editing.

The implementation is completely decoupled from Electron and follows Domain-Driven Design principles.

---

# Vision

Provide a flexible workspace platform capable of supporting:

- Local folders
- Remote workspaces
- SSH workspaces
- Dev Containers
- Cloud repositories
- Read-only workspaces
- Temporary workspaces

without requiring API changes to consumers.

---

# Objectives

## Functional

- Open workspace
- Close workspace
- Restore previous workspace
- Maintain recent workspaces
- Workspace settings
- Workspace metadata
- Workspace lifecycle
- Workspace events

## Non-Functional

- Platform independent
- Electron independent
- Immutable domain models
- Atomic persistence
- Event driven
- Thread safe
- Extensible URI abstraction

---

# User Experience

Users should be able to:

✓ Launch Open-Code.Studio

↓

Click **Open Folder**

↓

Choose a directory

↓

Workspace loads

↓

Explorer initializes

↓

Editor ready

↓

Workspace restored next launch

The transition should feel instantaneous.

---

# Scope

Included

- Workspace lifecycle
- Workspace registry
- Workspace settings
- Workspace persistence
- Workspace URI abstraction
- Workspace events
- Recent workspaces
- Session restore

Excluded

- Explorer
- Documents
- Editor
- Search
- Git
- AI indexing

---

# Architecture

## Layer Diagram

```
Renderer

↓

Typed IPC

↓

Workspace IPC Handler

↓

Workspace Service

↓

Workspace Registry

↓

Storage Adapter

↓

JSON Persistence
```

Workspace contains **no Electron imports**.

Electron exists only in Desktop Host.

---

# Package Structure

```
packages/workspace/

domain/
    Workspace
    WorkspaceUri
    WorkspaceState
    WorkspaceMetadata
    IWorkspaceContentIndexer

application/
    WorkspaceService
    WorkspaceRegistry
    WorkspaceSettingsRepository
    WorkspaceConfiguration

infrastructure/
    LocalFileSystem
    JsonStorageAdapter
    LocalVirtualFileSystem

events/
    WorkspaceEvents
```

---

# Core Components

## Workspace

Represents an active workspace.

Properties

```
id

uri

displayName

type

state

openedAt
```

Future

- Remote
- SSH
- Cloud
- Dev Container

---

## WorkspaceUri

Every path is represented by WorkspaceUri.

Examples

```
file:///workspace

ssh://server/project

devcontainer://node

cloud://github/repo
```

Consumers never manipulate paths directly.

---

## Workspace Registry

Responsibilities

- Active workspace
- Recent workspaces
- Metadata
- Persistence

Maximum recent entries

```
20
```

Old entries automatically removed.

---

## Workspace Settings Repository

Stores

```
.ocs/workspace.json
```

Current settings

- Sidebar width
- Layout
- Bottom panel
- Active workspace

Future

- Terminal layout
- Git state
- AI preferences
- Window state

---

## Workspace Service

Owns lifecycle.

Responsibilities

```
Open

Close

Reload

Update Settings

Restore

Dispose
```

Everything routes through this service.

---

## Storage Adapter

Current

```
JsonStorageAdapter
```

Future adapters

- SQLite
- IndexedDB
- Cloud
- Enterprise Sync

---

# State Machine

```
Closed

↓

Opening

↓

Open

↓

Closing

↓

Closed
```

Failure

```
Opening

↓

Failed

↓

Closed
```

Invalid transitions throw PlatformError.

---

# Persistence

Workspace metadata stored under

```
~/.ocs/workspaces.json
```

Workspace-specific configuration stored in

```
<workspace>/.ocs/workspace.json
```

Uses

Atomic Write

↓

Rename

to avoid corruption.

---

# IPC Contracts

Renderer APIs

```
window.ocs.workspace

open()

close()

restore()

getActive()

getRecent()

updateSettings()

removeRecent()
```

Main Process

```
workspace:open

workspace:close

workspace:get-active

workspace:get-recent

workspace:update-settings
```

---

# Events

Published

```
workspace.opening

workspace.opened

workspace.closed

workspace.failed

workspace.settingsChanged

workspace.recentUpdated
```

Consumers

- Explorer
- Document
- Editor
- Runtime
- Search
- Git

---

# Commands

Current

```
workspace.open

workspace.close

workspace.reload
```

Future

```
workspace.trust

workspace.switch

workspace.clone

workspace.attach
```

---

# Renderer Integration

Components

```
WelcomeScreen

WorkspaceLoader

Workbench
```

Hooks

```
useWorkspace()
```

Renderer never calls IPC directly.

---

# Services

```
WorkspaceService

WorkspaceRegistry

WorkspaceSettingsRepository

JsonStorageAdapter

ExplorerProvider
```

---

# Stories

## STORY-0001

Workspace Domain

Tasks

- Workspace model
- WorkspaceUri
- Metadata
- State machine

---

## STORY-0002

Workspace Registry

Tasks

- Active workspace
- Recent list
- Persistence

---

## STORY-0003

Workspace Service

Tasks

- Open
- Close
- Restore
- Update settings

---

## STORY-0004

IPC Integration

Tasks

- Typed IPC
- Preload
- Main handlers

---

## STORY-0005

Renderer

Tasks

- Welcome Screen
- Open Folder
- Recent Workspaces
- Workspace Loader

---

## STORY-0006

Persistence

Tasks

- JSON storage
- Atomic writes
- Restore

---

## STORY-0007

Diagnostics

Tasks

- Health
- Startup
- Restore validation

---

# Complete Task Checklist

## Domain

- [x] Workspace
- [x] WorkspaceUri
- [x] WorkspaceState
- [x] Metadata

## Application

- [x] WorkspaceService
- [x] Registry
- [x] Settings Repository

## Infrastructure

- [x] Storage Adapter
- [x] Local File System

## IPC

- [x] Main handlers
- [x] Preload
- [x] Renderer bridge

## Renderer

- [x] Welcome Screen
- [x] Loader
- [x] Session Restore

## Validation

- [x] Unit Tests
- [x] Type Safety
- [x] Architecture Check
- [x] Integration Tests

---

# Manual Verification

✓ Launch IDE

✓ Open Folder

✓ Native dialog appears

✓ Workspace loads

✓ Explorer initializes

✓ Close application

✓ Restart

✓ Previous workspace restored

✓ Recent workspaces updated

✓ Settings persisted

---

# Automated Verification

```bash
pnpm test

pnpm validate

pnpm --filter @ocs/workspace test

pnpm lint
```

Coverage Target

```
>= 90%
```

---

# Acceptance Criteria

Workspace Management is complete when:

- Local workspaces open successfully.
- Previous workspace restores automatically.
- Settings persist across sessions.
- No Electron imports exist inside `@ocs/workspace`.
- Consumers interact only through WorkspaceService and events.
- Atomic persistence prevents configuration corruption.

---

# Risks

| Risk                   | Mitigation               |
| ---------------------- | ------------------------ |
| Workspace corruption   | Atomic writes            |
| Platform coupling      | Electron isolation       |
| Path handling bugs     | WorkspaceUri abstraction |
| Startup failures       | Event-driven restore     |
| Future workspace types | Type discriminator       |

---

# Future Enhancements

Phase 2

- Multi-root workspaces

Phase 3

- Remote SSH

Phase 5

- Cloud workspaces

Phase 6

- Workspace memory

Phase 10

- Organization workspaces

---

# Deliverables

- Workspace Platform
- Workspace Registry
- Workspace Service
- Settings Repository
- URI Abstraction
- Session Restore
- Recent Workspace Management
- Workspace Events

---

# Epic Completion Summary

**Status:** ✅ Completed

**Outcome**

Open-Code.Studio now has a production-ready Workspace Platform that cleanly separates workspace lifecycle from UI and infrastructure. The platform is event-driven, persistence-backed, Electron-independent, and designed to support future workspace types without breaking existing consumers.

This platform serves as the foundation for the Explorer, Editor, Search, Git, AI Knowledge Engine, and Collaboration features implemented in later phases.

---

# Changelog

## v1.0.0

- Introduced Workspace Platform.
- Added WorkspaceUri abstraction.
- Implemented WorkspaceService and Registry.
- Added workspace settings persistence.
- Added session restore.
- Added typed IPC integration.
- Added renderer hooks.
- Added diagnostics and health reporting.
