# Workbench Architecture

> **Document:** `docs/architecture/11-workbench.md`
> **Version:** 1.0
> **Status:** Living Document

---

# Purpose

The Workbench is the primary application shell of Open Code Studio. It coordinates every visible
area of the IDE and provides the framework into which editors, explorers, panels, AI tools,
extensions, and future capabilities are integrated.

Unlike individual features, the Workbench owns layout, view composition, command routing,
focus management, and window state.

---

# Goals

- Provide a consistent application shell
- Support highly modular UI composition
- Persist user layout
- Enable extension-contributed views
- Keep rendering responsive
- Separate layout from feature logic

---

# High-Level Architecture

```text
+------------------------------------------------------+
|                   Window Frame                       |
+------------------------------------------------------+
| Activity Bar | Sidebar | Editor Area | Secondary Bar |
+------------------------------------------------------+
| Bottom Panel                                       |
+------------------------------------------------------+
| Status Bar                                         |
+------------------------------------------------------+
```

The Workbench coordinates these regions but does not implement feature-specific behavior.

---

# Core Responsibilities

- Window layout
- View registration
- Editor group management
- Command routing
- Focus management
- Context keys
- Layout persistence
- Theme propagation

---

# Major Components

## Layout Engine

Responsible for:

- Split layouts
- Resizing
- Docking
- Restoring previous layouts
- Responsive behavior

## View Registry

Maintains metadata for all registered views.

Examples:

- Explorer
- Search
- Source Control
- Extensions
- AI Chat

Views are registered declaratively and instantiated lazily.

## Activity Bar

Hosts top-level navigation entries.

Requirements:

- Extensible
- Keyboard accessible
- Badge support
- Context-aware visibility

## Sidebar

Displays the active view container.

Examples:

- Explorer
- Search
- Git
- Extensions

## Editor Area

Hosts one or more editor groups.

Supported:

- Tabs
- Split editors
- Preview editors
- Diff editors

See `10-editor.md`.

## Bottom Panel

Hosts supporting tools such as:

- Terminal
- Output
- Problems
- Debug Console

Panels are dockable and remember size and visibility.

## Status Bar

Displays global application status.

Examples:

- Git branch
- Encoding
- Line/column
- AI provider
- Notifications

---

# Command Routing

All user actions are represented as commands.

```text
Keyboard / Mouse
        |
        v
Command Registry
        |
        v
Application Service
```

The Workbench invokes commands but does not contain business logic.

---

# Context Key Service

Context keys control command enablement and UI visibility.

Examples:

- editorFocus
- workspaceOpen
- terminalFocus
- aiChatVisible

Extensions may contribute additional context keys.

---

# Focus Management

Only one control owns logical focus at a time.

Focus transitions are coordinated centrally to support:

- Keyboard navigation
- Accessibility
- Command execution

---

# Layout Persistence

Persist:

- Open editors
- Panel visibility
- Sidebar width
- Split configuration
- Active view
- Window state

State is restored during startup.

---

# Events

Publishes:

- WorkbenchReady
- ViewOpened
- ViewClosed
- LayoutChanged
- FocusChanged

Consumes:

- WorkspaceOpened
- ThemeChanged
- ConfigurationChanged

---

# Performance

- Lazy view creation
- Virtual rendering for large lists
- Deferred initialization of non-visible panels
- Minimal layout recalculation

---

# Accessibility

Support:

- Full keyboard navigation
- Screen readers
- High-contrast themes
- Focus indicators
- Reduced motion

---

# Security

The Workbench never directly performs privileged operations.
All filesystem, OS, and network actions are delegated to platform services.

---

# Testing

Required:

- Layout restoration
- Keyboard navigation
- Docking behavior
- Focus management
- Extension-contributed views
- Accessibility

---

# Future Evolution

- Multi-window workspaces
- Floating panels
- Collaborative sessions
- Custom workbench layouts
- Workspace profiles

---

# Related Documents

- 10-editor.md
- 12-extension-host.md
- 07-workspace.md
- 03-platform-layer.md

---

# Summary

The Workbench is the orchestration layer of the user interface. It provides a modular,
extensible shell that coordinates layout, navigation, commands, and view composition while
remaining independent of feature-specific business logic.
