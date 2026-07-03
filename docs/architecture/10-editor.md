# Editor Architecture

> **Document:** `docs/architecture/10-editor.md`
>
> **Version:** 1.0
>
> **Status:** Living Document

---

# Purpose

The Editor subsystem is responsible for presenting and editing documents.

It provides a high-performance editing experience built on top of Monaco while remaining independent of language implementations, AI providers, and extension logic.

The Editor is one of the most performance-critical components in the application.

---

# Goals

The Editor should provide:

- High-performance editing
- Large file support
- Split editors
- Multiple tabs
- Diff editor
- Rich language features
- AI assistance
- Extension support
- Accessibility
- Low memory usage

---

# Non-Goals

The Editor is **not** responsible for:

- Workspace management
- File watching
- Git operations
- AI model execution
- Extension lifecycle
- Configuration persistence

---

# Architecture Overview

```text
                    Document Service
                           │
                           ▼
                  Editor Controller
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   Monaco Adapter     Editor Groups     Decorations
        │                  │                  │
        └──────────────┬───┴──────────────────┘
                       ▼
                Editor Renderer
                       │
                       ▼
                     User
```

The Editor acts as a presentation layer over the Document subsystem.

---

# Core Components

## Editor Controller

Coordinates:

- Active editor
- Editor groups
- Commands
- Save lifecycle
- Focus management

The controller owns editor state but not document content.

---

## Monaco Adapter

Wraps Monaco Editor behind an internal abstraction.

Responsibilities:

- Model creation
- Decorations
- Language registration
- Theme updates
- Command registration

The application should never depend directly on Monaco APIs outside this adapter.

---

## Document Binding

Each editor is bound to one document.

```
Editor A
      │
      ▼
Document X

Editor B
      │
      ▼
Document X
```

Multiple editors may reference the same document instance.

---

# Editor Groups

Editor groups allow multiple editing areas.

Example:

```text
+----------------------+----------------------+
|     Editor Group 1   |    Editor Group 2   |
|                      |                     |
| main.ts              | app.ts             |
|                      |                     |
+----------------------+----------------------+
```

Supported layouts:

- Horizontal split
- Vertical split
- Grid (future)

---

# Tabs

Each group maintains an ordered collection of tabs.

```text
┌──────────────────────────────────────────┐
│ app.ts │ settings.ts │ main.ts │ +       │
└──────────────────────────────────────────┘
```

Each tab stores:

- Document reference
- Dirty state
- Pinned state
- Preview state
- Last active timestamp

---

# Preview Editors

Preview editors avoid creating unnecessary tabs.

Behavior:

- Single-click → Preview
- Double-click → Permanent
- Edit → Permanent

This reduces tab clutter.

---

# Editor Lifecycle

```text
Create

↓

Bind Document

↓

Initialize Monaco

↓

Render

↓

Edit

↓

Save

↓

Dispose
```

Resources should be released immediately after disposal.

---

# Diff Editor

The diff editor displays two document models.

```
Original
        │
        ▼

Diff Engine

        ▲
        │

Modified
```

Capabilities:

- Inline diff
- Side-by-side view
- Word diff
- Character diff

---

# Decorations

Decorations include:

- Errors
- Warnings
- Git changes
- Search results
- AI suggestions
- Breakpoints
- Current line
- Matching brackets

Decoration providers are independent and composable.

---

# Language Features

Provided through Language Service Providers.

Examples:

- Syntax highlighting
- Completion
- Hover
- Rename
- Go to definition
- References
- Formatting
- Code actions

The Editor consumes language services but does not implement them.

---

# Cursor Model

Each editor maintains:

- Primary cursor
- Secondary cursors
- Selections
- Caret position

Future support includes unlimited multi-cursor editing.

---

# Undo / Redo

Undo history belongs to the Document subsystem.

Editors simply visualize and execute history operations.

Benefits:

- Shared history across editor groups
- Stable undo behavior
- Consistent synchronization

---

# Search Integration

The editor supports:

- Find
- Replace
- Replace All
- Regex
- Whole Word
- Match Case
- Search in Selection

Search operations should be incremental for large files.

---

# AI Integration

The Editor exposes extension points for AI features.

Examples:

- Inline completion
- Chat sidebar
- Explain code
- Refactor
- Generate tests
- Fix diagnostics

AI providers communicate through the AI Platform rather than directly with the editor.

---

# Events

Publishes:

- EditorOpened
- EditorClosed
- EditorFocused
- CursorChanged
- SelectionChanged

Consumes:

- DocumentSaved
- ThemeChanged
- LanguageChanged
- ConfigurationChanged

---

# State Management

Editor state includes:

```text
Editor

├── Document

├── Cursor

├── Selection

├── Scroll Position

├── View State

└── Options
```

View state is restorable after reopening a document.

---

# Performance Strategy

Performance goals:

- Open files < 300 ms
- Scroll at 60 FPS
- Lazy editor initialization
- Virtual rendering
- Incremental syntax highlighting
- Background tokenization

Large files should disable expensive features automatically when thresholds are exceeded.

---

# Accessibility

Support:

- Screen readers
- Keyboard-only navigation
- High contrast themes
- Configurable font sizes
- Accessible command palette integration

---

# Security

The Editor:

- Never executes arbitrary code
- Treats file contents as untrusted
- Sanitizes rendered HTML
- Restricts embedded content

---

# Extension Points

Extensions may contribute:

- Commands
- Code actions
- Language providers
- Decorations
- Inlay hints
- Code lenses
- Folding providers
- Completion providers
- Hover providers

All contributions are routed through the Extension Host.

---

# Error Handling

Recoverable failures:

- Language service crash
- Extension failure
- Formatting timeout

The editor should remain operational even if optional providers fail.

---

# Testing Strategy

Required tests:

- Rendering
- Cursor movement
- Multi-cursor
- Undo/redo
- Decorations
- Split editors
- Diff editor
- Performance
- Accessibility

---

# Future Evolution

Planned enhancements:

- Collaborative editing
- Live cursors
- AI pair programming
- Semantic editing
- Structural editing
- CRDT synchronization
- Cloud-backed documents

---

# Related Documents

- 09-document.md
- 11-workbench.md
- 12-extension-host.md
- 14-ai-platform.md
- 17-performance.md

---

# Summary

The Editor subsystem provides a high-performance, extensible editing experience built on Monaco while remaining independent of workspace management, language implementations, and AI providers. By separating document ownership, rendering, and language services, the architecture supports scalability, extension compatibility, and future collaborative editing capabilities.
