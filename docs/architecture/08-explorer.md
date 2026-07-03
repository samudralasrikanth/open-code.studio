# Explorer Architecture

> Version: 1.0

---

# Purpose

The Explorer subsystem presents the workspace hierarchy to the user.

It is responsible for browsing, navigating, and managing files and folders.

The Explorer consumes Workspace events but does not manage filesystem state directly.

---

# Responsibilities

- Display workspace tree
- Expand/collapse folders
- Drag and drop
- File operations
- Context menus
- Decorations
- Search integration

---

# Architecture

```text
Workspace

↓

Explorer Service

↓

Tree Model

↓

Virtual Renderer

↓

Explorer View
```

---

# Tree Model

Each node contains:

```ts
ExplorerNode

├── id

├── path

├── type

├── children

├── expanded

├── selected

└── decorations
```

---

# Virtual Rendering

Large workspaces should use virtualization.

Benefits:

- Lower memory usage
- Faster rendering
- Smooth scrolling

Only visible nodes are rendered.

---

# File Operations

Explorer delegates operations to Platform Services.

Supported actions:

- New File
- New Folder
- Rename
- Delete
- Move
- Copy
- Paste

Explorer never manipulates the filesystem directly.

---

# Decorations

Decorations may originate from:

- Git
- Search
- Diagnostics
- Extensions
- AI

Decoration providers register independently.

---

# Context Menus

Menus are extensible.

Sources:

- Core application
- Extensions
- Enterprise features

Menu contributions are ordered by priority.

---

# Drag and Drop

Supported operations:

- Move
- Copy
- Multi-select
- External file import

Validation occurs before filesystem changes.

---

# Search Integration

Explorer consumes search results.

Capabilities:

- Highlight matches
- Auto-expand parents
- Filter view
- Reveal result

---

# Events

Consumes:

- WorkspaceOpened
- FileCreated
- FileDeleted
- FileMoved

Publishes:

- FileSelected
- ExplorerFocused
- ContextMenuOpened

---

# Performance

- Virtual tree
- Lazy folder expansion
- Cached icons
- Incremental refresh

---

# Accessibility

Support:

- Keyboard navigation
- Screen readers
- Focus management
- High contrast themes

---

# Related Documents

- 07-workspace.md
- 10-editor.md
- 11-workbench.md

---

# Summary

The Explorer subsystem provides a scalable, extensible view of workspace contents while delegating all business logic to platform services and maintaining high performance through virtualization.
