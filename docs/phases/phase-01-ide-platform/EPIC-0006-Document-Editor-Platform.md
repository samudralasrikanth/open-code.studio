# EPIC-0006 — Document & Editor Platform

| Property           | Value                          |
| ------------------ | ------------------------------ |
| Epic ID            | EPIC-0006                      |
| Phase              | Phase 1 – IDE Platform         |
| Status             | ✅ Completed                   |
| Priority           | Critical                       |
| Estimated Duration | 4 Weeks                        |
| Dependencies       | EPIC-0005 Explorer Platform    |
| Blocks             | EPIC-0007 Terminal Integration |

---

# Overview

EPIC-0006 transforms Open-Code.Studio from a workspace browser into a true Integrated Development Environment (IDE) by introducing two independent but closely collaborating platforms:

- **Document Platform** — Owns document lifecycle, persistence, dirty tracking, save/revert, caching, and synchronization.
- **Editor Platform** — Owns editor groups, tabs, layouts, preview tabs, split editors, navigation, and rendering adapters.

A key architectural decision is that **documents are not editors**.

Documents represent the source of truth.

Editors represent views of those documents.

Monaco is treated purely as an infrastructure adapter rather than the application's data model.

---

# Vision

Build an editor platform capable of supporting:

- Text editors
- Image viewers
- Markdown preview
- PDF viewer
- Diff editors
- Settings editors
- Notebook editors
- AI editors
- Future custom editors

without changing the core Editor Platform.

---

# Objectives

## Functional

- Open files
- Close files
- Preview tabs
- Pin tabs
- Split editors
- Dirty tracking
- Save
- Save As (future)
- Revert
- Restore session
- Multiple editor groups
- Monaco integration

## Non-Functional

- Editor independent from renderer
- Document independent from Monaco
- Zero keystroke IPC flooding
- Event driven
- Extensible editor types
- Layout persistence
- High performance

---

# Scope

Included

- Document Platform
- Editor Platform
- Monaco Adapter
- Model Manager
- Worker Loader
- Command Integration
- Dirty Tracking
- Session Restore
- Split Editors
- Preview Tabs

Excluded

- Terminal
- Git Diff
- Merge Editor
- Notebook
- Custom Editors
- Collaborative Editing

---

# Architecture

```
Explorer

↓

Command Registry

↓

Editor Service

↓

Editor Groups

↓

Editor Inputs

↓

Document Service

↓

Document Registry

↓

Monaco Adapter

↓

Monaco Models
```

Notice that Monaco exists at the bottom of the stack.

It is not the application's source of truth.

---

# Package Structure

```
packages/

document/

domain/
    Document
    TextDocument
    BinaryDocument
    SaveState

application/
    DocumentService
    DocumentRegistry
    DocumentCache
    UndoRedoService

editor/

domain/
    EditorInput
    EditorGroup
    EditorInputState
    SplitNode

application/
    EditorService
    EditorNavigationService
    EditorCommands

editor-monaco/

ModelManager

MonacoAdapter

WorkerLoader
```

---

# Platform Separation

## Document Platform

Owns

✓ Content

✓ Dirty state

✓ Save

✓ Revert

✓ Cache

✓ Version

✓ Encoding

✓ Language

Does NOT own

✗ Tabs

✗ Groups

✗ Split layouts

✗ Preview

---

## Editor Platform

Owns

✓ Tabs

✓ Groups

✓ Active editor

✓ Preview tabs

✓ Pinned tabs

✓ Split views

✓ Navigation history

Does NOT own

✗ File contents

✗ Saving

✗ Encoding

✗ Dirty calculations

---

# Document Platform

## Document

```
id

uri

language

encoding

version

checksum

saveState

isReadonly
```

Future

- Binary documents
- Remote documents
- Generated documents

---

## Document Registry

Responsibilities

- Open documents
- Cache documents
- Lookup by URI
- Reuse existing models

---

## Document Cache

Implementation

```
LRU Cache
```

Purpose

Avoid keeping hundreds of inactive documents in memory.

Future

Adaptive cache sizing.

---

## Save State

```
Clean

Dirty

Saving

SaveFailed
```

Every document exists in exactly one state.

---

## UndoRedo Service

Current

Stub implementation.

Future

Shared undo transactions across:

- Editor
- Refactoring
- AI
- Multi-file edits

---

# Editor Platform

## Editor Input

Represents anything that can appear inside an editor tab.

Current

```
TextEditorInput
```

Future

```
ImageEditorInput

MarkdownPreviewInput

NotebookInput

DiffInput

SettingsInput

CustomInput
```

---

## Editor Group

Responsibilities

- Active input
- Preview input
- Pinned tabs
- Tab ordering
- Group state

Supports

```
Single

Split Right

Split Down
```

Future

Nested grid layout.

---

## Split Layout

Current

Recursive SplitNode

```
Root

├── Left

└── Right
```

Future

Unlimited nesting.

---

## Navigation Service

Tracks

- Back
- Forward
- MRU (Most Recently Used)

Future

Jump history.

---

# Monaco Integration

## Model Manager

Responsibilities

- Create models
- Cache models
- Dispose models
- Language mapping

One Monaco model exists per URI.

---

## Monaco Adapter

Responsibilities

- Render editor
- Connect model
- Listen to changes
- Flush updates
- Configure editor

Contains no business logic.

---

## Worker Loader

Responsible for

- JSON worker
- TypeScript worker
- HTML worker
- CSS worker

Future

Additional language workers.

---

# Flush Strategy

Renderer updates immediately.

Synchronization occurs:

```
Typing

↓

Renderer Model

↓

Idle (2s)

↓

Main Process
```

Immediate flush also occurs on:

- Save
- Blur
- Tab switch
- Editor disposal

This prevents IPC flooding.

---

# Renderer Components

```
Workbench

EditorArea

SplitContainer

EditorGroupView

TabBar

Tab

MonacoEditorView
```

Hooks

```
useEditor()

useDocument()
```

---

# Commands

Current

```
editor.open

editor.close

editor.pin

editor.splitRight

editor.splitDown

document.save

document.revert
```

Future

```
editor.moveGroup

editor.duplicate

editor.compare

editor.reopenClosed

editor.next

editor.previous
```

---

# Events

Document Events

```
document.opened

document.changed

document.saved

document.closed

document.reverted
```

Editor Events

```
editor.opened

editor.closed

editor.groupChanged

editor.activeChanged

editor.layoutChanged
```

Workspace Event

```
workspace.opened
```

Triggers automatic layout restoration.

---

# IPC Contracts

Renderer APIs

```
window.ocs.document

open()

update()

save()

revert()
```

```
window.ocs.editor

open()

close()

split()

restore()
```

---

# Session Restore

Persisted

```
workspace.json

layout

groups

activeGroup

previewTabs

sidebarWidth

bottomPanelHeight
```

Automatically restored when:

```
workspace.opened
```

event is received.

Workspace never directly calls EditorService.

---

# Stories

## STORY-0015

Document Platform

Tasks

- Document models
- Save state
- Registry
- Cache

---

## STORY-0016

Editor Platform

Tasks

- Groups
- Tabs
- Preview
- Split layouts

---

## STORY-0017

Monaco Integration

Tasks

- Adapter
- Model Manager
- Worker Loader

---

## STORY-0018

Commands

Tasks

- Save
- Revert
- Split
- Open
- Close

---

## STORY-0019

Renderer

Tasks

- Editor Area
- Split Container
- Tab Bar
- Monaco View

---

## STORY-0020

Session Restore

Tasks

- Persist layout
- Restore groups
- Restore preview tabs

---

# Complete Task Checklist

## Document Platform

- [x] DocumentService
- [x] Registry
- [x] Cache
- [x] SaveState
- [x] UndoRedo abstraction

## Editor Platform

- [x] EditorService
- [x] EditorGroup
- [x] EditorInput
- [x] SplitNode

## Monaco

- [x] Adapter
- [x] ModelManager
- [x] WorkerLoader

## Commands

- [x] Save
- [x] Revert
- [x] Split Right
- [x] Split Down
- [x] Pin
- [x] Close

## Renderer

- [x] EditorArea
- [x] SplitContainer
- [x] TabBar
- [x] MonacoEditorView

## Validation

- [x] Unit Tests
- [x] Integration Tests
- [x] pnpm validate

---

# Manual Verification

✓ Open file from Explorer

✓ Opens as preview tab

✓ Double-click pins tab

✓ Edit document

✓ Dirty indicator appears

✓ Save (Ctrl/Cmd+S)

✓ Dirty indicator disappears

✓ Split editor

✓ Multiple groups render correctly

✓ Restart IDE

✓ Layout restores

✓ Documents restore

✓ Preview tabs restore

---

# Automated Verification

```bash
pnpm --filter @ocs/document test

pnpm --filter @ocs/editor test

pnpm --filter @ocs/editor-monaco test

pnpm validate
```

Coverage Target

```
>=90%
```

---

# Acceptance Criteria

The Document & Editor Platform is complete when:

- Documents are independent of editor views.
- Monaco acts solely as a rendering adapter.
- Dirty tracking is accurate.
- Commands route through the CommandRegistry.
- Split editor layouts function correctly.
- Preview and pinned tabs behave correctly.
- Session restore recreates the previous editor state.
- No direct workspace-to-editor coupling exists.

---

# Risks

| Risk                       | Mitigation                        |
| -------------------------- | --------------------------------- |
| Monaco model leaks         | ModelManager lifecycle management |
| IPC flooding               | Deferred flush strategy           |
| Editor/document coupling   | Strict platform separation        |
| Complex layout restoration | Recursive SplitNode model         |
| Future editor types        | EditorInput abstraction           |

---

# Future Enhancements

EPIC-0007

Integrated Terminal

EPIC-0008

Git Diff Editor

EPIC-0010

Search Results Editor

Phase 6

AI Review Editor

Phase 9

Custom Editors

Phase 15

Collaborative Editing

---

# Deliverables

- Document Platform
- Editor Platform
- Monaco Integration
- ModelManager
- WorkerLoader
- Editor Commands
- Split Editor Layout
- Session Restore
- Dirty Tracking
- Preview & Pinned Tabs

---

# Epic Completion Summary

**Status:** ✅ Completed

**Outcome**

Open-Code.Studio now includes a fully decoupled Document and Editor Platform where documents own application state, editors manage presentation and layout, and Monaco functions purely as a rendering engine. This architecture enables future support for custom editors, advanced navigation, AI-assisted editing, and collaborative features without redesigning the platform.

---

# Changelog

## v1.0.0

- Introduced Document Platform with registry, cache, and save lifecycle.
- Added Editor Platform with groups, preview tabs, and split layouts.
- Integrated Monaco through ModelManager and Adapter.
- Implemented command-driven editor interactions.
- Added session persistence and automatic layout restoration.
- Established event-driven synchronization between workspace, document, and editor platforms.
