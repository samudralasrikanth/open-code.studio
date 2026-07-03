# EPIC-0015 — Session & Workbench Restore

| Property           | Value                                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Epic ID            | EPIC-0015                                                                                                                     |
| Phase              | Phase 1 – IDE Platform                                                                                                        |
| Status             | 📋 Planned                                                                                                                    |
| Priority           | Critical                                                                                                                      |
| Estimated Duration | 2 Weeks                                                                                                                       |
| Dependencies       | EPIC-0004 Workspace, EPIC-0005 Explorer, EPIC-0006 Document & Editor, EPIC-0007 Terminal, EPIC-0011 Settings, EPIC-0012 Theme |
| Blocks             | Phase 2 Runtime, Phase 6 Agent Platform                                                                                       |

---

# Overview

The Session & Workbench Restore Platform enables Open-Code.Studio to restore the user's workspace exactly as it was before shutdown.

Unlike simply reopening files, this platform restores the complete IDE state including editor groups, cursor positions, terminal sessions, explorer expansion, UI layout, view states, scroll positions, active tools, and future AI conversations.

The goal is to make reopening the IDE feel like waking a suspended workspace rather than launching a new application.

---

# Vision

Create a professional session management platform that restores an entire development environment with zero manual recovery.

Future restore capabilities include:

- Workspace state
- Editor layout
- Explorer state
- Search state
- Terminal sessions
- Debug sessions
- AI conversations
- Workflow executions
- Extension state

without tightly coupling any subsystem.

---

# Objectives

## Functional

- Restore workspace
- Restore editor tabs
- Restore split layout
- Restore cursor position
- Restore scroll position
- Restore terminal sessions
- Restore explorer expansion
- Restore panel layout
- Restore active theme
- Restore window state

## Non-Functional

- Fast startup
- Incremental restore
- Fault tolerant
- Versioned session format
- Event driven
- Extensible

---

# Scope

Included

- Session Platform
- Workbench State
- Layout Restore
- Editor Restore
- Explorer Restore
- Terminal Restore
- Window Restore
- State Versioning

Excluded

- Remote sessions
- Cloud synchronization
- Team sessions
- AI memory restore
- Workflow checkpoint restore

---

# Architecture

```
Application Shutdown

↓

Session Manager

↓

Platform Snapshots

↓

Session Store

↓

Restart

↓

Session Loader

↓

Platform Restore
```

Each platform restores itself independently.

---

# Package Structure

```
packages/session/

domain/
    Session
    SessionSnapshot
    RestoreState
    RestorePolicy

application/
    SessionService
    SessionManager
    SnapshotCoordinator
    RestoreCoordinator

infrastructure/
    JsonSessionStore

events/
    SessionEvents

commands/
    SessionCommands
```

---

# Core Components

## Session Service

Responsibilities

- Save session
- Restore session
- Validate session
- Version migration
- Publish lifecycle events

Acts as the platform entry point.

---

## Snapshot Coordinator

Collects snapshots from every platform.

Example

```
Workspace

Explorer

Editor

Terminal

Panels

Settings

Theme
```

Produces one unified session document.

---

## Restore Coordinator

Restores platforms in dependency order.

```
Workspace

↓

Explorer

↓

Editor

↓

Terminal

↓

Workbench

↓

Panels
```

No platform restores another platform directly.

---

## Session Model

```
version

workspace

layout

editor

explorer

terminal

panels

theme

window

timestamp
```

---

## Session Versioning

Supports

```
v1

↓

v2

↓

v3
```

Automatic migration allows old sessions to remain usable after upgrades.

---

## Restore Policies

```
Always Restore

Ask User

Never Restore

Restore Last Workspace Only

Restore Empty Window
```

Configured through Settings.

---

# Restored State

## Workspace

- Active workspace
- Recent workspaces

---

## Explorer

- Expanded folders
- Selected node
- Scroll position

---

## Editor

- Open tabs
- Active tab
- Preview tabs
- Split layout
- Cursor position
- Selection
- Scroll position

---

## Terminal

- Terminal layout
- Working directory
- Shell profile
- Running process metadata

---

## Workbench

- Sidebar visibility
- Bottom panel
- Panel sizes
- Activity Bar selection
- Window dimensions

---

# Renderer Components

```
RestoreProgress

SessionRecoveryDialog

RestoreErrorDialog
```

---

# Commands

```
session.save

session.restore

session.reset

session.export

session.import

session.openBackup
```

---

# Events

```
session.saving

session.saved

session.loading

session.loaded

session.failed

session.reset
```

---

# APIs

## SessionService

```
save()

restore()

reset()

export()

import()

validate()

migrate()
```

---

# IPC Contracts

Renderer

```
window.ocs.session

save()

restore()

reset()

status()

export()
```

Main

```
session:save

session:restore

session:reset

session:status
```

---

# Stories

## STORY-0015-001

Session Model

Tasks

- Session schema
- Versioning
- Validation

---

## STORY-0015-002

Snapshot Platform

Tasks

- Snapshot coordinator
- Platform registration
- Serialization

---

## STORY-0015-003

Restore Platform

Tasks

- Dependency ordering
- Restore coordinator
- Error recovery

---

## STORY-0015-004

Workbench Restore

Tasks

- Layout
- Sidebar
- Bottom panel
- Activity Bar

---

## STORY-0015-005

Editor Restore

Tasks

- Tabs
- Groups
- Cursor
- Scroll
- Preview tabs

---

## STORY-0015-006

Terminal Restore

Tasks

- Sessions
- Layout
- Shell profile

---

## STORY-0015-007

Recovery

Tasks

- Corrupt sessions
- Migration
- Backup
- Reset

---

# Complete Task Checklist

## Domain

- [ ] Session model
- [ ] Snapshot model
- [ ] Restore policy

## Application

- [ ] SessionService
- [ ] SnapshotCoordinator
- [ ] RestoreCoordinator
- [ ] Migration engine

## Infrastructure

- [ ] JSON storage
- [ ] Version migration

## Renderer

- [ ] Restore progress
- [ ] Recovery dialog
- [ ] Restore status

## Validation

- [ ] Unit tests
- [ ] Integration tests
- [ ] Restart tests

---

# Manual Verification

✓ Open workspace

✓ Open multiple tabs

✓ Split editors

✓ Expand explorer

✓ Open terminals

✓ Close IDE

✓ Reopen IDE

✓ Entire workbench restores correctly

✓ Corrupted session handled gracefully

✓ Reset session works

---

# Automated Verification

```bash
pnpm --filter @ocs/session test

pnpm validate

pnpm lint

pnpm typecheck
```

Coverage Target

```
>=90%
```

Performance Targets

| Metric           | Target  |
| ---------------- | ------- |
| Session Save     | <100 ms |
| Session Restore  | <500 ms |
| Startup Overhead | <10%    |

---

# Acceptance Criteria

The Session Platform is complete when:

- Workbench layout restores accurately.
- Editor groups and tabs restore correctly.
- Explorer expansion state restores.
- Terminal layout restores.
- Window state restores.
- Session format supports version migration.
- Individual platform failures do not prevent startup.

---

# Risks

| Risk                    | Mitigation           |
| ----------------------- | -------------------- |
| Corrupt session files   | Validation & backups |
| Slow startup            | Incremental restore  |
| Version incompatibility | Migration engine     |
| Platform coupling       | Snapshot coordinator |
| Large session files     | Lazy restoration     |

---

# Future Enhancements

- Cloud Session Sync
- Cross-device Restore
- Workspace Snapshots
- Session Timeline
- AI Conversation Restore
- Workflow Resume
- Team Shared Sessions
- Crash Recovery

---

# Deliverables

- Session Platform
- Session Service
- Snapshot Coordinator
- Restore Coordinator
- Workbench Restore
- Terminal Restore
- Session Migration
- Recovery System

---

# Traceability

Implements

- REQ-SESSION-001 Session Persistence
- REQ-SESSION-002 Workbench Restore
- REQ-SESSION-003 Recovery
- REQ-SESSION-004 Version Migration

Related ADRs

- ADR-032 Session Platform
- ADR-033 Snapshot Architecture

Related Events

- session.saved
- session.loaded
- session.failed

Related Commands

- session.save
- session.restore
- session.reset

---

# Epic Completion Summary

**Target Release:** **v0.1.0 Alpha**

This epic completes the Professional IDE Platform by introducing a comprehensive Session & Workbench Restore system. Rather than reopening files, Open-Code.Studio restores the entire development environment—including layout, editors, terminals, explorer state, and UI configuration—creating a seamless continuation of the user's work while providing the architectural foundation for future cloud synchronization, AI session recovery, and collaborative workspaces.

---

# Changelog

## v1.0.0 (Planned)

- Initial Session Platform specification.
- Added SessionService, Snapshot Coordinator, Restore Coordinator, session versioning, workbench restoration, migration support, recovery system, commands, events, APIs, and extensibility model.
