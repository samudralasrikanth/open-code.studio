# EPIC-0014 — Keyboard Shortcut Platform

| Property           | Value                                                  |
| ------------------ | ------------------------------------------------------ |
| Epic ID            | EPIC-0014                                              |
| Phase              | Phase 1 – IDE Platform                                 |
| Status             | 📋 Planned                                             |
| Priority           | High                                                   |
| Estimated Duration | 2 Weeks                                                |
| Dependencies       | EPIC-0009 Command Palette, EPIC-0011 Settings Platform |
| Blocks             | Phase 6 Agent Platform, Phase 9 Extension Ecosystem    |

---

# Overview

The Keyboard Shortcut Platform provides a unified keybinding system for Open-Code.Studio. Every keyboard interaction is resolved through a centralized Keybinding Service that maps user input to registered commands.

The platform supports user customization, context-aware shortcuts, multi-key chords, conflict detection, extension-contributed shortcuts, and future AI-generated keybindings.

Unlike directly listening for keyboard events in components, every shortcut is resolved through the Keybinding Platform.

---

# Vision

Create a keyboard platform comparable to VS Code while extending it to support:

- User-defined shortcuts
- Workspace shortcuts
- Context-aware bindings
- Multi-step key chords
- Extension keybindings
- AI-generated shortcuts
- Workflow shortcuts

---

# Objectives

## Functional

- Keyboard shortcut registry
- Context-aware shortcuts
- Multi-key chords
- Shortcut editor
- Import/export keybindings
- Conflict detection
- Shortcut search
- Reset defaults
- Extension shortcuts

## Non-Functional

- Low latency (<10ms)
- Platform independent
- Event-driven
- Extensible
- Persistent
- Customizable

---

# Scope

Included

- Keyboard Platform
- Keybinding Registry
- Keybinding Service
- Shortcut Editor
- Conflict Detection
- Context Keys
- Chord Support
- User Overrides

Excluded

- Voice shortcuts
- Gesture shortcuts
- Macro recording
- AI shortcut suggestions

---

# Architecture

```
Keyboard Event

↓

Keybinding Resolver

↓

Keybinding Service

↓

Command Registry

↓

Command Handler

↓

Platform Service
```

Every shortcut eventually executes a registered command.

---

# Package Structure

```
packages/keybindings/

domain/
    Keybinding
    KeyChord
    ContextKey
    ShortcutConflict

application/
    KeybindingService
    KeybindingRegistry
    ContextService
    ConflictResolver

infrastructure/
    KeyboardEventAdapter

events/
    KeybindingEvents

commands/
    KeybindingCommands
```

---

# Core Components

## Keybinding Service

Responsibilities

- Register shortcuts
- Resolve shortcuts
- Execute commands
- Apply overrides
- Persist user bindings

Acts as the platform entry point.

---

## Keybinding Registry

Stores

- Default shortcuts
- User shortcuts
- Workspace shortcuts
- Extension shortcuts

Priority

```
Workspace

↓

User

↓

Extension

↓

Default
```

---

## Context Keys

Shortcuts are enabled only when specific contexts are active.

Examples

```
editorFocus

terminalFocus

explorerFocus

gitRepository

debugSession

searchPanel
```

Example

```
Ctrl+C

Editor Focus

↓

Copy

Terminal Focus

↓

Send SIGINT
```

---

## Key Chords

Supports

```
Ctrl+K Ctrl+C

Ctrl+K Ctrl+S

Ctrl+Shift+P
```

Unlimited future chord support.

---

## Conflict Resolver

Detects

- Duplicate bindings
- Invalid bindings
- Shadowed bindings
- Platform conflicts

Suggests alternative shortcuts.

---

# Storage

Current

```
~/.open-code/keybindings.json
```

Future

```
Workspace keybindings

Organization policies

Cloud Sync
```

---

# Renderer Components

```
KeyboardShortcutEditor

ShortcutSearch

ShortcutConflictDialog

KeyCaptureDialog
```

---

# Commands

```
keybindings.open

keybindings.reset

keybindings.import

keybindings.export

keybindings.record

keybindings.search
```

---

# Events

```
keybinding.registered

keybinding.changed

keybinding.executed

keybinding.conflictDetected

keybinding.reset
```

---

# APIs

## KeybindingService

```
register()

unregister()

resolve()

execute()

search()

export()

import()

reset()
```

---

# IPC Contracts

Renderer

```
window.ocs.keybindings

list()

update()

reset()

search()

export()

import()
```

Main

```
keybindings:list

keybindings:update

keybindings:reset

keybindings:search
```

---

# Stories

## STORY-0014-001

Keybinding Registry

Tasks

- Default shortcuts
- User overrides
- Workspace overrides

---

## STORY-0014-002

Resolver Engine

Tasks

- Context resolution
- Chord resolution
- Command execution

---

## STORY-0014-003

Conflict Detection

Tasks

- Duplicate detection
- Platform validation
- Suggestions

---

## STORY-0014-004

Shortcut Editor

Tasks

- Search
- Edit
- Capture keys
- Reset

---

## STORY-0014-005

Persistence

Tasks

- JSON storage
- Import
- Export

---

## STORY-0014-006

Extension Integration

Tasks

- Extension shortcuts
- Dynamic registration
- Context merging

---

# Complete Task Checklist

## Domain

- [ ] Keybinding model
- [ ] Chord model
- [ ] Context model

## Application

- [ ] KeybindingService
- [ ] Registry
- [ ] Resolver
- [ ] Conflict detector

## Infrastructure

- [ ] Keyboard adapter
- [ ] JSON storage

## Renderer

- [ ] Shortcut editor
- [ ] Conflict dialog
- [ ] Search

## Validation

- [ ] Unit tests
- [ ] Integration tests

---

# Manual Verification

✓ Shortcut executes command

✓ User shortcut overrides default

✓ Context switching works

✓ Chord shortcuts execute correctly

✓ Conflict warnings appear

✓ Export/import works

✓ Restart preserves shortcuts

---

# Automated Verification

```bash
pnpm --filter @ocs/keybindings test

pnpm validate

pnpm lint

pnpm typecheck
```

Coverage Target

```
>=90%
```

Performance Target

| Metric              | Target       |
| ------------------- | ------------ |
| Shortcut Resolution | <10 ms       |
| Context Switch      | <5 ms        |
| Chord Timeout       | Configurable |

---

# Acceptance Criteria

The Keyboard Shortcut Platform is complete when:

- Every shortcut resolves through the Keybinding Service.
- User overrides work correctly.
- Context-aware bindings function reliably.
- Multi-key chords are supported.
- Conflicts are detected and reported.
- Extensions can contribute shortcuts dynamically.

---

# Risks

| Risk                 | Mitigation                 |
| -------------------- | -------------------------- |
| Shortcut conflicts   | Conflict resolver          |
| Platform differences | Platform-specific defaults |
| Input latency        | Cached lookup tables       |
| Extension collisions | Registry ownership         |

---

# Future Enhancements

- AI shortcut recommendations
- Macro recording
- Command sequences
- Gesture shortcuts
- Voice shortcuts
- Cloud synchronization

---

# Deliverables

- Keyboard Shortcut Platform
- Keybinding Registry
- Keybinding Service
- Shortcut Editor
- Conflict Detection
- Chord Support
- Import/Export

---

# Traceability

Implements

- REQ-KEY-001 Keybinding Registry
- REQ-KEY-002 Context-aware Shortcuts
- REQ-KEY-003 Chord Support
- REQ-KEY-004 Shortcut Customization

Related ADRs

- ADR-030 Keyboard Platform
- ADR-031 Context Key System

Related Events

- keybinding.executed
- keybinding.changed
- keybinding.conflictDetected

Related Commands

- keybindings.open
- keybindings.reset
- keybindings.search

---

# Epic Completion Summary

**Target Release:** v0.1.0 Alpha

This epic establishes a professional Keyboard Shortcut Platform for Open-Code.Studio by centralizing keybinding resolution, context awareness, user customization, and extension integration. It provides the foundation for efficient developer workflows while enabling future AI-assisted shortcut recommendations and workflow automation.

---

# Changelog

## v1.0.0 (Planned)

- Initial Keyboard Shortcut Platform specification.
- Added KeybindingService, Registry, Context Engine, Chord support, Conflict Resolver, Shortcut Editor, commands, events, APIs, and persistence.
