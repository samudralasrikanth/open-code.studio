# EPIC-0007 — Terminal Integration

| Property           | Value                                                                |
| ------------------ | -------------------------------------------------------------------- |
| Epic ID            | EPIC-0007                                                            |
| Phase              | Phase 1 – IDE Platform                                               |
| Status             | 📋 Planned                                                           |
| Priority           | Critical                                                             |
| Estimated Duration | 2–3 Weeks                                                            |
| Dependencies       | EPIC-0004 Workspace, EPIC-0005 Explorer, EPIC-0006 Document & Editor |
| Blocks             | EPIC-0008 Git Integration, EPIC-0015 Session Restore                 |

---

# Overview

The Terminal Platform introduces an integrated terminal subsystem into Open-Code.Studio, enabling developers to execute shell commands, run build tools, debug applications, manage Git workflows, and interact with AI-generated commands without leaving the IDE.

The Terminal is implemented as a platform rather than embedding xterm.js directly. xterm.js becomes only a rendering adapter, while the platform owns sessions, lifecycle, persistence, commands, shell integration, and future remote execution.

---

# Vision

Create a professional terminal platform comparable to VS Code while remaining extensible enough to support:

- Local terminals
- Remote terminals
- Docker terminals
- SSH terminals
- Kubernetes terminals
- AI terminals
- Workflow terminals

without changing the platform architecture.

---

# Objectives

## Functional

- Integrated terminal
- Multiple terminals
- Split terminals
- Terminal tabs
- Rename terminals
- Kill terminals
- Restart terminals
- Persistent terminal history
- Terminal commands
- Shell detection

## Non-Functional

- Platform independent
- Electron independent
- High performance
- Session persistence
- Low memory footprint
- Event driven

---

# Scope

Included

- Terminal Platform
- Terminal Service
- Terminal Sessions
- Terminal Groups
- PTY abstraction
- xterm.js adapter
- Shell integration
- Bottom panel integration
- Command integration
- Session persistence

Excluded

- SSH terminals
- Docker terminals
- Kubernetes terminals
- AI command generation
- Collaborative terminals

---

# Architecture

```
Workbench

↓

Terminal Panel

↓

Terminal Service

↓

Terminal Session Manager

↓

PTY Adapter

↓

Shell Process

↓

Operating System
```

Renderer never communicates directly with the shell.

---

# Package Structure

```
packages/terminal/

domain/
    TerminalSession
    TerminalProfile
    TerminalGroup
    TerminalState

application/
    TerminalService
    TerminalManager
    TerminalHistory
    TerminalPersistence

infrastructure/
    PtyAdapter
    LocalShell
    XtermAdapter

events/
    TerminalEvents

commands/
    TerminalCommands
```

---

# Core Components

## Terminal Service

Responsibilities

- Create terminals
- Close terminals
- Restart terminals
- Rename terminals
- Persist sessions
- Broadcast events

Acts as the primary entry point.

---

## Terminal Session

Represents one running shell.

Properties

- id
- name
- shell
- cwd
- pid
- status
- createdAt

Future

- Remote session
- Docker session
- SSH session

---

## Terminal Group

Supports

- Split terminals
- Active session
- Layout

Future

Nested layouts.

---

## PTY Adapter

Responsibilities

- Spawn shell
- Read output
- Send input
- Resize terminal
- Kill process

Current implementation

```
node-pty
```

Future

Remote PTY adapters.

---

## xterm Adapter

Responsibilities

- Render terminal
- ANSI colors
- Cursor
- Clipboard
- Selection
- Links

No business logic.

---

## Shell Detection

Automatically detect

- PowerShell
- CMD
- Bash
- Zsh
- Fish

Workspace settings override defaults.

---

# Renderer Components

```
TerminalPanel

TerminalTabs

TerminalView

SplitTerminalView

TerminalToolbar
```

---

# Commands

```
terminal.new

terminal.split

terminal.close

terminal.kill

terminal.restart

terminal.clear

terminal.rename

terminal.focus

terminal.next

terminal.previous

terminal.scrollTop

terminal.scrollBottom
```

---

# Events

```
terminal.created

terminal.closed

terminal.started

terminal.stopped

terminal.output

terminal.input

terminal.renamed

terminal.focusChanged

terminal.layoutChanged
```

---

# APIs

## TerminalService

```
create()

close()

restart()

rename()

focus()

sendText()

resize()

getSessions()

restore()
```

---

# IPC Contracts

Renderer

```
window.ocs.terminal

create()

close()

focus()

sendText()

resize()

list()

restore()
```

Main

```
terminal:create

terminal:close

terminal:resize

terminal:input

terminal:list
```

---

# Stories

## STORY-0007-001

Terminal Domain

Tasks

- Session model
- Group model
- State model
- Profiles

---

## STORY-0007-002

PTY Adapter

Tasks

- node-pty integration
- Resize
- Exit detection
- Shell spawning

---

## STORY-0007-003

Terminal Service

Tasks

- Create
- Close
- Rename
- Restart
- Persistence

---

## STORY-0007-004

xterm Renderer

Tasks

- Terminal rendering
- Themes
- Clipboard
- Links

---

## STORY-0007-005

Split Terminals

Tasks

- Split horizontally
- Split vertically
- Resize

---

## STORY-0007-006

Command Integration

Tasks

- Register commands
- Keyboard shortcuts
- Context menus

---

## STORY-0007-007

Persistence

Tasks

- Restore sessions
- Restore layout
- Restore cwd

---

# Complete Task Checklist

## Domain

- [ ] TerminalSession
- [ ] TerminalGroup
- [ ] TerminalProfile
- [ ] TerminalState

## Application

- [ ] TerminalService
- [ ] TerminalManager
- [ ] History
- [ ] Persistence

## Infrastructure

- [ ] node-pty adapter
- [ ] xterm adapter
- [ ] Shell detection

## Renderer

- [ ] Terminal panel
- [ ] Terminal tabs
- [ ] Split terminals
- [ ] Toolbar

## Commands

- [ ] Terminal commands
- [ ] Keyboard shortcuts
- [ ] Context menus

## Validation

- [ ] Unit tests
- [ ] Integration tests
- [ ] Benchmarks

---

# Manual Verification

✓ Open terminal

✓ Execute command

✓ Split terminal

✓ Rename terminal

✓ Resize panel

✓ Restart terminal

✓ Restore after restart

✓ Multiple terminals work independently

---

# Automated Verification

```bash
pnpm --filter @ocs/terminal test

pnpm validate

pnpm lint

pnpm typecheck
```

Coverage Target

```
>=90%
```

---

# Acceptance Criteria

The Terminal Platform is complete when:

- Multiple terminals operate simultaneously.
- Split terminals work correctly.
- Commands execute through PTY.
- Terminal state restores across sessions.
- Shell detection works on supported platforms.
- Renderer remains decoupled from PTY implementation.

---

# Risks

| Risk                             | Mitigation                     |
| -------------------------------- | ------------------------------ |
| PTY process leaks                | Lifecycle management           |
| Large output performance         | Buffered rendering             |
| Cross-platform shell differences | Shell abstraction              |
| Renderer coupling                | xterm adapter pattern          |
| Session corruption               | Persistent metadata validation |

---

# Future Enhancements

- SSH terminals
- Docker terminals
- Kubernetes terminals
- AI-generated command suggestions
- Command history synchronization
- Shared collaborative terminals
- Terminal recording and replay

---

# Deliverables

- Terminal Platform
- Terminal Service
- PTY Adapter
- xterm Integration
- Terminal Panel
- Split Terminal Support
- Session Persistence
- Command Integration

---

# Traceability

Implements

- REQ-TERM-001 Terminal Management
- REQ-TERM-002 Terminal Sessions
- REQ-TERM-003 Split Terminals
- REQ-TERM-004 Shell Integration

Related ADRs

- ADR-016 Terminal Platform
- ADR-017 PTY Abstraction

Related Events

- terminal.created
- terminal.output
- terminal.closed

Related Commands

- terminal.new
- terminal.split
- terminal.close

---

# Epic Completion Summary

**Target Release:** v0.1.0 Alpha

This epic completes the integrated terminal experience for Open-Code.Studio, providing a scalable Terminal Platform that supports multiple sessions, split layouts, persistent state, and a clean abstraction over PTY and rendering technologies. It establishes the foundation for future remote terminals, AI-assisted terminal workflows, and enterprise execution environments.

---

# Changelog

## v1.0.0 (Planned)

- Initial Terminal Platform specification.
- Introduced TerminalService, PTY abstraction, xterm adapter, terminal commands, events, session persistence, and split-terminal architecture.
