# EPIC-0003 — Desktop Bootstrap

| Property           | Value                                                    |
| ------------------ | -------------------------------------------------------- |
| Epic ID            | EPIC-0003                                                |
| Phase              | Phase 0 – Foundation                                     |
| Status             | ✅ Completed                                             |
| Priority           | Critical                                                 |
| Estimated Duration | 2 Weeks                                                  |
| Dependencies       | EPIC-0001 Repository Foundation, EPIC-0002 Core Platform |
| Blocks             | EPIC-0004 Workspace Management                           |

---

# Overview

EPIC-0003 establishes the Desktop Host for Open-Code.Studio.

It provides the Electron application lifecycle, React renderer, secure preload bridge, IPC infrastructure, native window management, application menus, startup orchestration, diagnostics, and platform bootstrapping.

This Epic intentionally contains very little IDE functionality. Instead, it provides the runtime shell that all future IDE capabilities execute inside.

---

# Vision

Provide a secure, modular, high-performance desktop host that:

- Boots consistently on all supported platforms
- Maintains strict separation between Main, Preload, and Renderer
- Exposes only typed APIs to the renderer
- Prevents direct Node.js access from React
- Supports future services without startup complexity

---

# Goals

## Functional Goals

- Bootstrap Electron
- Bootstrap React
- Configure Electron Vite
- Secure Preload
- Typed IPC
- Window Management
- Native Menu
- Startup Coordinator
- Diagnostics
- Theme Management
- Platform Health

## Non-Functional Goals

- Startup < 2 seconds
- Secure context isolation
- Typed IPC only
- Platform independent
- Easily testable
- Crash-resistant startup
- Modular bootstrap process

---

# Scope

Included

- Electron Main Process
- React Renderer
- Preload
- Context Bridge
- IPC
- Window Manager
- Native Menu
- Startup Coordinator
- Diagnostics
- Health APIs
- Bootstrap modules

Excluded

- Workspace
- Explorer
- Editor
- Terminal
- Git
- AI
- Runtime
- Extensions

---

# Architecture

## Desktop Architecture

```
Electron Main
        │
        ▼
Startup Coordinator
        │
        ▼
Bootstrap Modules
        │
        ▼
DI Container
        │
        ▼
Window Manager
        │
        ▼
IPC
        │
        ▼
Preload
        │
        ▼
React Renderer
```

---

# Bootstrap Modules

The desktop host is initialized using dedicated bootstrap modules.

```
bootstrap/

workspace.ts

explorer.ts

document.ts

desktop.ts

ipc.ts

startup-coordinator.ts
```

Each module owns a single responsibility.

---

# Main Process

Responsibilities

- Electron lifecycle
- DI initialization
- Window creation
- Menu creation
- IPC registration
- Startup coordination
- Health monitoring

Contains

```
main.ts

window-manager.ts

menu.ts
```

---

# Preload Process

Responsibilities

- Secure Context Bridge
- Typed IPC wrappers
- No business logic
- No direct file system exposure

Exposes

```
window.ocs

workspace

explorer

document

editor

commands

diagnostics

theme
```

---

# Renderer

Responsibilities

- React Application
- UI
- Hooks
- Screens
- Components

Never imports

- Electron
- fs
- child_process
- Node APIs

Everything goes through:

```
window.ocs
```

---

# IPC Architecture

```
Renderer

↓

Preload

↓

ipcRenderer

↓

ipcMain

↓

Platform Services

↓

Response
```

All IPC messages are:

- Typed
- Validated
- Versioned

---

# Startup Coordinator

Purpose

Replace startup spaghetti with deterministic startup phases.

Execution Order

```
Platform

↓

Desktop

↓

Workspace

↓

Explorer

↓

Document

↓

Editor

↓

Wire

↓

IPC

↓

Restore

↓

Ready
```

Each phase reports:

- Pending
- Running
- Complete
- Failed

Failures are isolated where possible.

---

# Window Manager

Responsibilities

- Create BrowserWindow
- Restore window state
- Multi-monitor support
- Fullscreen
- Minimize
- Maximize
- Theme updates

Future

- Multiple workspaces
- Multiple windows

---

# Native Menu

Responsibilities

- macOS App Menu
- File Menu
- Edit Menu
- View Menu
- Window Menu
- Help Menu

Future

Commands routed through CommandRegistry.

---

# Diagnostics

Provides

- Startup phases
- Platform status
- Memory usage
- IPC health
- Workspace status
- Explorer status

Future

- Document status
- Runtime status
- AI status

---

# Stories

## STORY-0016 — Electron Bootstrap

Tasks

- Configure Electron
- Configure Electron Vite
- Configure entry points
- Configure packaging

Acceptance

Application launches.

---

## STORY-0017 — React Renderer

Tasks

- React root
- Theme provider
- Routing
- Global styles

Acceptance

Renderer loads successfully.

---

## STORY-0018 — Secure Preload

Tasks

- Context Bridge
- Typed APIs
- IPC wrappers

Acceptance

Renderer has no direct Node access.

---

## STORY-0019 — IPC Platform

Tasks

- IPC Channels
- Main handlers
- Validation
- Error propagation

Acceptance

Typed communication works.

---

## STORY-0020 — Window Manager

Tasks

- BrowserWindow
- State restore
- Multi-monitor
- Events

Acceptance

Window lifecycle stable.

---

## STORY-0021 — Menu Platform

Tasks

- Native menus
- Keyboard shortcuts
- Menu actions

Acceptance

Menus work on all platforms.

---

## STORY-0022 — Startup Coordinator

Tasks

- Startup phases
- Dependency ordering
- Failure isolation
- Status reporting

Acceptance

Startup deterministic.

---

## STORY-0023 — Diagnostics

Tasks

- Health endpoint
- Startup report
- Platform report
- Diagnostics panel

Acceptance

Subsystem health available.

---

# Complete Task Checklist

## Electron

- [x] Electron configured
- [x] Electron Vite
- [x] Packaging

## Renderer

- [x] React
- [x] Theme
- [x] Routing

## Preload

- [x] Context Bridge
- [x] Typed APIs
- [x] IPC wrappers

## IPC

- [x] Typed channels
- [x] Main handlers
- [x] Error handling

## Desktop

- [x] Window Manager
- [x] Native Menu
- [x] Platform bootstrap

## Startup

- [x] Bootstrap modules
- [x] Startup Coordinator
- [x] Startup phases

## Diagnostics

- [x] Health
- [x] Diagnostics
- [x] Startup reporting

---

# Public APIs

## Window

```
create()

close()

focus()

restore()
```

## IPC

```
invoke()

handle()

send()

on()
```

## Diagnostics

```
health()

status()

startup()

platform()
```

---

# Events

Platform Events

```
app.ready

window.created

window.closed

renderer.ready

ipc.connected

startup.phase.started

startup.phase.completed

startup.failed

health.changed
```

---

# Verification

## Automated

```bash
pnpm dev

pnpm build

pnpm validate
```

Expected

- Electron builds
- Renderer builds
- IPC types compile
- Startup succeeds

---

## Manual

Verify

- Application launches
- Window appears
- Menu visible
- Theme switching works
- Diagnostics available
- IPC communication succeeds
- No preload security violations
- Startup phases complete successfully

---

# Acceptance Criteria

This Epic is complete when:

- Electron launches successfully.
- React renderer initializes.
- Secure preload bridge is active.
- Typed IPC communication is operational.
- Startup coordinator executes successfully.
- Window and menu management work on all supported platforms.
- Diagnostics report healthy platform status.

---

# Risks

| Risk                     | Mitigation                  |
| ------------------------ | --------------------------- |
| Electron security        | Context Isolation + Preload |
| Startup race conditions  | Startup Coordinator         |
| IPC contract drift       | Shared typed channels       |
| Large main.ts            | Bootstrap modules           |
| Renderer using Node APIs | Context Bridge only         |

---

# Deliverables

- Electron Desktop Host
- React Renderer
- Secure Preload
- Typed IPC Platform
- Window Manager
- Native Menu
- Startup Coordinator
- Diagnostics Platform
- Health Monitoring

---

# Epic Completion Summary

**Status:** ✅ Complete

**Outcome:**

Open-Code.Studio now has a secure, modular, and production-ready desktop host. The application launches through a deterministic startup pipeline, exposes only typed APIs to the renderer, and provides the runtime foundation required for all IDE functionality introduced in Phase 1.

---

# Changelog

## v1.0.0

- Implemented Electron desktop host.
- Added React renderer bootstrap.
- Introduced secure preload with typed context bridge.
- Implemented IPC platform.
- Added Window Manager and native menu.
- Introduced Startup Coordinator and modular bootstrap.
- Added diagnostics and health reporting.
