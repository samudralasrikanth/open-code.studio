# EPIC-0006 — Document & Editor Platform

**Phase:** Phase 0 — Foundation / Phase 1 — IDE Platform

**Priority:** P0

**Estimated Sprint:** Sprint 3

**Status:** Completed

**Owner:** Open-Code.Studio Core Team

**Version:** 1.0

---

# Executive Summary

The Document & Editor Platform provides the core infrastructure for opening, editing, saving, and rendering files inside Open-Code.Studio.

A primary design driver is the complete decoupling of **Document state** (source code content, dirty state, file system synchronization, encoding) from the **Editor view state** (rendering engine, cursor positions, selections, scroll positions). This architecture ensures that:

1. Documents are not owned by editors and can exist without an active editor (e.g., for search indexing, diagnostic scans, or background AI refactoring).
2. A single Document can be rendered simultaneously across multiple split editor groups, with modifications in one view propagating instantly to others.
3. The UI components (built in React) and text rendering engine (Monaco Editor) do not run logic that mutations documents directly, instead issuing commands through an asynchronous command pipeline.

This platform bridges the Electron main process (where core services and file system operations reside) and the renderer process (where React and Monaco editor instances are mounted) via a robust IPC channel architecture.

---

# Goal

Design and implement a robust, decoupled, and testable Document & Editor Platform consisting of:

- A `DocumentService` managing document cache lifecycle, file-system resolution, and dirty state.
- An `EditorService` managing multi-group split-layout trees, tab lifecycles (preview vs. pinned), and active view groups.
- A `MonacoEditorAdapter` adapting Monaco instances to the platform contracts.
- Typed IPC handlers facilitating thread-safe state synchronization and auto-flush editing behavior.

---

# Business Value

- **Robust Developer Experience**: Tab management, split editors, and preview states replicate the industry-standard developer ergonomics.
- **Architectural Scalability**: Easy pluggability of new document/editor types (e.g., Image Viewers, Hex editors) without modifying Monaco or React views.
- **AI Integration Foundation**: Decoupled documents allow AI agents to parse, analyze, and modify workspace files without forcing active visual tabs to open or flicker.
- **Performance**: Keeps UI rendering separated from IO/OS disk operations, meeting strict responsiveness targets (<50ms editor switching).

---

# Scope

## In Scope

- **Document Platform**: Interfaces for Text and Binary documents, Registry, Cache, and FileSystemResolver.
- **Editor Platform**: EditorInput base abstraction, EditorGroups, WorkbenchLayout management, and Session Restore (serialization/deserialization).
- **Monaco Integration**: ModelManager caching `ITextModel` by URI, MonacoEditorAdapter wrapper, and change-flush debouncing strategies.
- **Commands & Keybindings**: Core commands for opening, closing, pinning, and splitting editors.
- **IPC Interface**: Synchronizing state changes and file content modifications between renderer and main processes.

## Out of Scope

- AI-assisted editor inline completions (EPIC-0022).
- Git diff/decorations within Monaco gutter (EPIC-0011).
- Custom non-text editor renderers (e.g., rich PDF viewer).
- Multi-root workspace directory watching (EPIC-0004/0005).

---

# Dependencies

| Epic                                     | Required | Status   |
| ---------------------------------------- | -------- | -------- |
| EPIC-0002 — Core Platform (DI, EventBus) | ✅       | Complete |
| EPIC-0004 — Workspace Platform           | ✅       | Complete |
| EPIC-0005 — Explorer Platform            | ✅       | Complete |

---

# Architecture

## High-Level Design

```
                     +---------------------------------------+
                     |            Renderer Process           |
                     |                                       |
                     |  +-----------------+                  |
                     |  |  React App UI   |                  |
                     |  +--------+--------+                  |
                     |           | (calls hooks)             |
                     |           v                  (IPC)    |
                     |  +-----------------+        IpcChannels
                     |  | MonacoEditorView| -------------->  |
                     |  +--------+--------+                  |
                     |           | (uses)                    |
                     |           v                           |
                     |  +-----------------+                  |
                     |  |MonacoEditorAdpt |                  |
                     |  +-----------------+                  |
                     +-----------|---------------------------+
                                 |
                                 | (IPC call/send)
                                 v
                     +---------------------------------------+
                     |             Main Process              |
                     |                                       |
                     |  +-----------------+                  |
                     |  | registerHandlrs |                  |
                     |  +--------+--------+                  |
                     |           | (resolves)                |
                     |           v                           |
                     |  +-----------------+                  |
                     |  |  EditorService  |                  |
                     |  +--------+--------+                  |
                     |           | (references)              |
                     |           v                           |
                     |  +-----------------+                  |
                     |  | DocumentService |                  |
                     |  +--------+--------+                  |
                     |           | (synchronizes)            |
                     |           v                           |
                     |  +-----------------+                  |
                     |  |   FileSystem    |                  |
                     |  +--------+--------+                  |
                     +---------------------------------------+
```

---

## Packages

The platform logic is structured across three core packages and one application package:

1. **`packages/document`**: Implements logical document models, caching, resolvers, and the undo/redo stack.
2. **`packages/editor`**: Implements editor groups, input wrappers, tree split-layouts, and history navigation.
3. **`packages/editor-monaco`**: Wraps the Monaco Editor core library, implements the adapter interface, and tracks text models.
4. **`apps/studio`**: Connects main and renderer processes through Electron IPC handlers, menus, and React UI layout.

---

## Public APIs

### DocumentService

- `openDocument(uri: WorkspaceUri): Promise<IDocument>`
- `closeDocument(uri: WorkspaceUri): void`
- `updateDocumentText(uri: WorkspaceUri, text: string): void`
- `revertDocument(uri: WorkspaceUri): Promise<void>`
- `saveDocument(uri: WorkspaceUri): Promise<void>`

### EditorService

- `openEditor(input: EditorInput, options?: { preview?: boolean; active?: boolean; group?: EditorGroup | string }): void`
- `closeEditor(input: EditorInput, group?: EditorGroup): void`
- `splitActiveGroup(orientation: "horizontal" | "vertical", newGroupId: string): EditorGroup`
- `restoreState(state: EditorState, inputResolver: (id: string) => Promise<EditorInput>): Promise<void>`

---

## Events

Cross-cutting updates are emitted through the platform's EventBus:

| Event Type             | Publisher       | Subscribers             | Payload                                                   |
| ---------------------- | --------------- | ----------------------- | --------------------------------------------------------- |
| `document.opened`      | DocumentService | UI, Extension Host      | `{ uri: WorkspaceUri }`                                   |
| `document.closed`      | DocumentService | UI, Cache Manager       | `{ uri: WorkspaceUri }`                                   |
| `document.changed`     | DocumentService | UI tabs, File Watcher   | `{ uri: WorkspaceUri, isDirty: boolean }`                 |
| `document.saved`       | DocumentService | Explorer, Git Subsystem | `{ uri: WorkspaceUri }`                                   |
| `document.reverted`    | DocumentService | MonacoEditorAdapter, UI | `{ uri: WorkspaceUri }`                                   |
| `editor.opened`        | EditorService   | LayoutManager, Tab view | `{ input: EditorInput, group: EditorGroup }`              |
| `editor.closed`        | EditorService   | LayoutManager           | `{ input: EditorInput, group: EditorGroup }`              |
| `editor.activeChanged` | EditorService   | Breadcrumbs, Status Bar | `{ input: EditorInput \| undefined, group: EditorGroup }` |

---

## Commands

Commands are mapped through the global application command registry:

- `editor.open`: Opens a document in the active/specified editor group.
- `editor.close`: Closes an editor input and prompts to save if dirty.
- `editor.pin`: Promotes a preview editor tab to a pinned state.
- `editor.splitRight`: Splits the active editor group horizontally.
- `editor.splitDown`: Splits the active editor group vertically.
- `document.revert`: Reverts document text to its saved file-system state.

---

# Stories

---

## STORY-0006-001 — Document Domain & Service

### Goal

Implement the core document models, dirty states, and lifecycle management.

### Tasks

- [x] Create `IDocument`, `ITextDocument`, and `IBinaryDocument` domain models.
- [x] Implement `DocumentCache` with reference counting to prevent premature garbage collection.
- [x] Implement `FileSystemDocumentResolver` to resolve WorkspaceUri paths into concrete Document instances using the platform FileSystem.
- [x] Implement `DocumentService` exposing public APIs for opening, saving, updating, and reverting documents.
- [x] Create `UndoRedoService` stub for future transaction/edit stack management.

### Acceptance Criteria

- Files can be read and resolved into memory cached documents.
- Reference counting correctly prevents eviction of documents currently in use.
- Saving a dirty text document writes contents back to the virtual file system.

---

## STORY-0006-002 — Editor Domain & Layout Management

### Goal

Implement editor input wrappers, multi-tab group managers, and split-editor layouts.

### Tasks

- [x] Define `EditorInput` and `DocumentEditorInput` abstractions to represent items open in editor tabs.
- [x] Implement `EditorGroup` managing a list of active inputs, including the preview tab slot.
- [x] Implement `WorkbenchLayout` supporting split node trees (horizontal/vertical) for split-screen layouts.
- [x] Implement `EditorService` orchestrating commands like opening, closing, and splitting editors.
- [x] Implement `EditorNavigationService` tracking back/forward navigation histories.

### Acceptance Criteria

- Splitting editor layout recursively creates horizontally/vertically nested EditorGroup nodes.
- Pinned tabs are preserved, while preview tabs are replaced when opening new documents.
- Editor service successfully serializes and restores layout and tab states.

---

## STORY-0006-003 — Monaco Editor Integration & Flush Strategy

### Goal

Integrate the Monaco Editor renderer adapter and configure synchronization strategies.

### Tasks

- [x] Implement `ModelManager` to construct and cache Monaco `ITextModel` instances mapping to URIs.
- [x] Create `MonacoEditorAdapter` adapting editor commands (mount, unmount, openInput, focus) to standard Monaco APIs.
- [x] Implement a debounced text-flush strategy that updates the document platform model on typing (300ms delay) and flushes immediately on editor blur.

### Acceptance Criteria

- Monaco Editor mounts correctly inside container divs.
- Opening files updates Monaco model text and maps language highlightings correctly based on file extensions.
- Focus-out (blur) events trigger immediate synchronization of text modifications to the main process document state.

---

## STORY-0006-004 — IPC Handlers & Renderer Wiring

### Goal

Bridge main process services and renderer React UI components over Electron IPC handlers.

### Tasks

- [x] Register Electron main process IPC handlers for document actions (`DOCUMENT_OPEN`, `DOCUMENT_SAVE`, `DOCUMENT_UPDATE`, `DOCUMENT_REVERT`, `DOCUMENT_GET`).
- [x] Register IPC handlers for editor layout serialization (`EDITOR_GET_STATE`) and events (`EDITOR_STATE_CHANGED`).
- [x] Develop React workbench views (`EditorArea`, `MonacoEditorView`, `EditorInputTabs`) mapping state from `useEditor` and `useDocument` hooks.

### Acceptance Criteria

- React views render correct layout structures dynamically matching the serialized `WorkbenchLayout` state.
- Tab bar buttons close tabs, double-clicking tabs pins them, and split buttons execute corresponding split commands.
- Closing a dirty editor tab prompts the user with a native Electron dialog box (Save, Don't Save, Cancel).

---

# Technical Requirements

## Performance

- **Editor Switch Latency**: <50ms when switching between already resolved tabs.
- **Debounce Threshold**: 300ms for background thread text flushes to minimize main-process IPC traffic.
- **Eviction Overhead**: Memory caches should remain stable and clean when opening over 100 files sequentially.

## Security

- IPC validation: Path names received from the renderer must be converted and verified against active workspace bounds via `WorkspaceUri`.
- No raw file system writes: All disk IO must pass through the `IFileSystem` wrapper with proper workspace permission checks.

---

# Testing Strategy

## Unit & Integration Tests

All tests are implemented using `vitest` under:

- `packages/document/tests/DocumentPlatform.test.ts` (Validates cache reference counts, concurrent updates, saving, and reverting).
- `packages/editor/tests/EditorPlatform.test.ts` (Validates tab pinning, split layout trees, and state restoration).
- `packages/editor-monaco/tests/MonacoIntegration.test.ts` (Validates model creation, caches, and Monaco mount/open lifecycles).

---

# Definition of Done

- All stories are complete and tested.
- `pnpm validate` passes all formatting, linting, typechecking, and test steps.
- Test coverage for core platform packages is maintained above 90%.
- Walkthrough is updated to reflect execution.

---

# Post Implementation Summary

## What Was Built

We successfully built a decoupled, event-driven Document & Editor Platform that handles the lifecycle of open files in Open-Code.Studio. By decoupling document state from editor views, we have paved the way for robust multi-split screens and background AI model integration.

## Lessons Learned

- **Monaco Mocking**: Mocking Monaco APIs in a Node test environment requires strict isolation since Monaco is designed primarily for browser environments. Our virtual `mockModel` implementation correctly verifies adapter behaviors.
- **IPC Frequency**: Debouncing edits at 300ms prevents IPC bottlenecks when typing rapidly in high-density source files.

## Next Epic

`EPIC-0007 — Workbench Platform` (incorporating sidebar, bottoms panel, status bar, and activity bar with this Editor/Document area).
