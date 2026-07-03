# System Overview

> **Document:** `docs/architecture/01-system-overview.md`
> **Version:** 1.0
> **Status:** Living Document
> **Audience:** Architects, Contributors, Maintainers

---

# Purpose

This document describes the overall architecture of **Open Code Studio**.

It serves as the architectural foundation for the project and explains how the application's major subsystems collaborate to deliver a secure, extensible, AI-first development environment.

This document intentionally focuses on **system-level architecture**. Detailed implementation guidance for each subsystem is documented in the corresponding architecture documents.

---

# Goals

Open Code Studio is designed to achieve the following goals:

- AI-first development experience
- Modular architecture
- Cross-platform desktop support
- VS Code extension compatibility where practical
- Enterprise readiness
- High performance
- Secure-by-default execution
- Maintainable codebase
- Independent subsystem evolution

---

# Non-Goals

This document does **not** describe:

- Individual package implementations
- UI component design
- API specifications
- Database schemas
- Individual services
- Platform-specific implementation details

Those topics are covered in dedicated architecture documents.

---

# System Context

```
                    ┌────────────────────────┐
                    │        Developer       │
                    └────────────┬───────────┘
                                 │
                                 ▼
                 ┌─────────────────────────────────┐
                 │        Open Code Studio         │
                 └─────────────────────────────────┘
                    │        │         │
                    │        │         │
          ┌─────────┘        │         └────────────┐
          ▼                  ▼                      ▼
     Local Files       AI Providers          Extensions
          │                  │                      │
          ▼                  ▼                      ▼
     Operating System   MCP / APIs        Extension Marketplace
```

The application acts as an orchestration platform connecting the user, the local development environment, AI providers, and extensible tooling.

---

# Architectural Principles

The architecture is guided by the following principles.

## Layered Architecture

Responsibilities are separated into clearly defined layers.

Each layer communicates only with adjacent layers.

---

## Composition Over Inheritance

Subsystems should be assembled from reusable components rather than deep inheritance hierarchies.

---

## Dependency Inversion

High-level modules depend on interfaces, not implementations.

All core services are resolved through dependency injection.

---

## Event-Driven Communication

Independent subsystems communicate through events whenever direct coupling is unnecessary.

---

## Extensibility

Core functionality should be extensible without modifying existing code.

Examples include:

- Extensions
- AI providers
- Themes
- Languages
- Source control providers

---

## Security by Default

Every subsystem assumes untrusted input until validated.

Security boundaries are explicit throughout the architecture.

---

## Performance First

Performance considerations influence architectural decisions from the beginning rather than being added later.

---

# High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                     User Interface                  │
├─────────────────────────────────────────────────────┤
│                     Workbench                       │
├─────────────────────────────────────────────────────┤
│               Application Services                  │
├─────────────────────────────────────────────────────┤
│                  Platform Services                  │
├─────────────────────────────────────────────────────┤
│ Infrastructure │ AI │ Extensions │ Workspace │ Git  │
├─────────────────────────────────────────────────────┤
│             Electron Main Process                  │
├─────────────────────────────────────────────────────┤
│                Operating System                     │
└─────────────────────────────────────────────────────┘
```

---

# Runtime Architecture

Open Code Studio consists of three primary execution environments.

## Renderer Process

Responsibilities:

- User interface
- Editors
- Workbench
- Views
- Panels
- Commands
- State management

The renderer never accesses privileged operating system resources directly.

---

## Main Process

Responsibilities:

- Native APIs
- Window lifecycle
- Secure IPC
- Filesystem coordination
- Native dialogs
- OS integration

The main process is the only component with unrestricted operating system access.

---

## Extension Host

Responsibilities:

- Execute extensions
- Isolate failures
- Load contributed commands
- Language features
- Debug adapters
- Third-party integrations

The extension host communicates through well-defined APIs and IPC channels.

---

# Layered Architecture

```
Presentation Layer
        │
        ▼
Workbench Layer
        │
        ▼
Application Layer
        │
        ▼
Platform Layer
        │
        ▼
Infrastructure Layer
        │
        ▼
Operating System
```

## Presentation Layer

Contains all user-facing interface components.

Examples:

- Editors
- Explorer
- Panels
- Command Palette
- Status Bar

---

## Workbench Layer

Coordinates all user interface modules and user workflows.

Responsibilities include:

- Layout management
- View registration
- Command routing
- Workspace coordination

---

## Application Layer

Contains feature orchestration without directly depending on UI implementation.

Examples:

- Workspace lifecycle
- AI orchestration
- Search
- Source control

---

## Platform Layer

Provides reusable infrastructure services.

Examples:

- Logging
- Configuration
- Storage
- File system
- Telemetry
- Preferences

---

## Infrastructure Layer

Wraps operating system and third-party integrations.

Examples:

- Electron
- Git
- Local filesystem
- SQLite
- HTTP clients

---

# Major Subsystems

## Workbench

Coordinates the entire user experience.

Responsibilities include:

- Layout
- Views
- Commands
- Context
- Navigation

See:

`11-workbench.md`

---

## Workspace

Represents one or more opened project folders.

Provides:

- File watching
- Search indexing
- Settings
- Build context

See:

`07-workspace.md`

---

## Editor

Responsible for text editing and document presentation.

Features:

- Monaco integration
- Split editors
- Diff editor
- Decorations
- Undo/redo

See:

`10-editor.md`

---

## Explorer

Provides project navigation.

Features include:

- Tree view
- Search
- Drag-and-drop
- Context menus
- Git decorations

See:

`08-explorer.md`

---

## AI Platform

Provides provider-independent AI capabilities.

Responsibilities:

- Prompt execution
- Context assembly
- Tool invocation
- Model management
- Streaming responses

See:

`14-ai-platform.md`

---

## Extension Platform

Provides controlled extensibility.

Supports:

- Commands
- Views
- Languages
- Themes
- Debuggers
- AI tools

See:

`12-extension-host.md`

---

# Request Lifecycle

A typical command flows through the following sequence:

```
User Action
      │
      ▼
Workbench Command
      │
      ▼
Command Registry
      │
      ▼
Application Service
      │
      ▼
Platform Service
      │
      ▼
Infrastructure
      │
      ▼
Operating System
      │
      ▼
Response
      │
      ▼
Renderer Update
```

Each layer performs only the work appropriate to its responsibility.

---

# Event Flow

The application uses an event-driven architecture for cross-cutting communication.

Example:

```
WorkspaceOpened
        │
        ├── Explorer Refresh
        ├── Git Refresh
        ├── Search Index
        ├── AI Context Update
        └── Status Bar Update
```

This minimizes direct dependencies between subsystems.

---

# Security Boundaries

The primary trust boundaries are:

1. Renderer ↔ Main Process
2. Core Application ↔ Extension Host
3. Application ↔ AI Providers
4. Application ↔ External Services
5. Workspace ↔ Operating System

All communication across these boundaries must be validated.

---

# Performance Strategy

Performance goals include:

- Fast startup
- Lazy initialization
- Virtualized rendering
- Background indexing
- Incremental workspace loading
- Streaming AI responses
- Efficient memory usage

Performance requirements are detailed in `17-performance.md`.

---

# Extensibility Model

Open Code Studio is designed around extension points rather than direct modification.

Supported extension areas include:

- Commands
- Menus
- Views
- Themes
- Languages
- AI Providers
- Source Control
- Debug Adapters
- Workspace Providers

All extensions execute in isolated environments.

---

# Cross-Cutting Concerns

The following concerns span multiple subsystems:

- Logging
- Configuration
- Dependency Injection
- Telemetry
- Error Handling
- Accessibility
- Internationalization
- Authentication
- Observability

These capabilities are implemented as platform services rather than duplicated across features.

---

# Architectural Constraints

The following rules are mandatory:

- UI must not access Node.js APIs directly.
- Renderer must communicate with the main process only through IPC.
- Platform services must expose interfaces.
- Circular dependencies are prohibited.
- Public APIs must remain backward compatible whenever possible.
- Long-running work must not block the UI thread.

---

# Related Architecture Documents

| Document                   | Purpose                  |
| -------------------------- | ------------------------ |
| 02-monorepo.md             | Repository organization  |
| 03-platform-layer.md       | Platform services        |
| 04-di.md                   | Dependency Injection     |
| 05-eventbus.md             | Event architecture       |
| 06-ipc.md                  | IPC design               |
| 07-workspace.md            | Workspace model          |
| 08-explorer.md             | Explorer architecture    |
| 09-document.md             | Document lifecycle       |
| 10-editor.md               | Editor subsystem         |
| 11-workbench.md            | Workbench architecture   |
| 12-extension-host.md       | Extension runtime        |
| 13-vscode-compatibility.md | Compatibility strategy   |
| 14-ai-platform.md          | AI subsystem             |
| 15-enterprise-platform.md  | Enterprise capabilities  |
| 16-security.md             | Security architecture    |
| 17-performance.md          | Performance architecture |
| 18-testing.md              | Testing strategy         |
| 19-future.md               | Long-term roadmap        |

---

# Summary

Open Code Studio is organized as a layered, modular desktop platform that emphasizes separation of concerns, extensibility, security, and performance. The architecture is intentionally structured so that each subsystem evolves independently while communicating through stable interfaces, dependency injection, and event-driven patterns.

This document provides the architectural map for the remainder of the architecture handbook.
