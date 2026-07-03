# Open Code Studio Architecture

> Version: 1.0
> Status: Living Document
> Owner: Architecture Team

---

# Purpose

This document provides a high-level view of the Open Code Studio architecture.

It explains how the platform is organized, the major subsystems, architectural principles, and where to find detailed architecture documentation.

This document intentionally avoids implementation details. Those belong inside the `/docs/architecture` folder.

---

# Architecture Goals

Open Code Studio is designed around the following principles:

- Modular
- Extensible
- Platform independent
- AI-first
- VS Code compatible where practical
- Enterprise ready
- Testable
- Observable
- Secure by default

---

# High Level Architecture

```
                    User
                     │
                     ▼
            Renderer (React UI)
                     │
           Event Bus / Commands
                     │
                     ▼
             Workbench Layer
                     │
     ┌───────────────┼────────────────┐
     │               │                │
     ▼               ▼                ▼
 Explorer        Editor         AI Platform
     │               │                │
     └───────────────┼────────────────┘
                     ▼
              Platform Services
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
   Workspace      FileSystem      Git
      │              │              │
      └──────────────┼──────────────┘
                     ▼
             Electron Main Process
                     │
                  Native APIs
```

---

# Architectural Layers

Open Code Studio follows a layered architecture.

```
UI Layer

↓

Workbench Layer

↓

Application Services

↓

Platform Services

↓

Infrastructure

↓

Operating System
```

Each layer only communicates with the layer directly beneath it.

No layer may bypass architectural boundaries.

---

# Major Components

## Renderer

Responsible for:

- UI
- State management
- Panels
- Editors
- Views
- Commands

Documentation:

```
architecture/10-editor.md
architecture/11-workbench.md
```

---

## Electron Main

Responsible for:

- Native APIs
- Window management
- IPC
- File system access
- Secure bridges

Documentation:

```
architecture/06-ipc.md
```

---

## Platform Layer

Provides reusable services used throughout the application.

Examples:

- FileService
- ConfigurationService
- ThemeService
- WorkspaceService
- LoggingService
- StorageService

Documentation:

```
architecture/03-platform-layer.md
```

---

## Dependency Injection

Every service is resolved through dependency injection.

Benefits:

- Loose coupling
- Easy testing
- Replaceable implementations
- Plugin friendliness

Documentation:

```
architecture/04-di.md
```

---

## Event Bus

Components communicate using events rather than direct dependencies.

Benefits:

- Low coupling
- Better scalability
- Easier feature additions

Documentation:

```
architecture/05-eventbus.md
```

---

## Workspace

Workspace is the central abstraction representing an opened project.

Responsibilities:

- Folder management
- Multi-root support
- Settings
- File watching
- Search

Documentation:

```
architecture/07-workspace.md
```

---

## Explorer

Provides:

- File tree
- Search
- Context menus
- Drag & drop
- Git decorations

Documentation:

```
architecture/08-explorer.md
```

---

## Editor

Responsible for:

- Tabs
- Monaco integration
- Split editors
- Diff editor
- Decorations
- Language services

Documentation:

```
architecture/10-editor.md
```

---

## AI Platform

Provides:

- LLM providers
- Prompt execution
- Tool calling
- MCP integration
- Context management
- AI history

Documentation:

```
architecture/14-ai-platform.md
```

---

## Enterprise Platform

Responsible for:

- Authentication
- Organizations
- RBAC
- Policies
- Audit logs
- Secrets
- Cloud synchronization

Documentation:

```
architecture/15-enterprise-platform.md
```

---

# Monorepo Structure

```
apps/
packages/
extensions/
tools/
docs/
```

Detailed documentation:

```
architecture/02-monorepo.md
```

---

# Extension Architecture

Extensions execute in an isolated Extension Host.

They communicate with the application through well-defined APIs.

Benefits:

- Stability
- Security
- Sandboxing
- VS Code compatibility

Documentation:

```
architecture/12-extension-host.md
architecture/13-vscode-compatibility.md
```

---

# Security Model

Security principles include:

- Least privilege
- IPC validation
- Input sanitization
- Secure storage
- Secrets isolation
- Permission boundaries

Documentation:

```
architecture/16-security.md
```

---

# Performance Strategy

Performance priorities:

- Lazy loading
- Virtual rendering
- Incremental indexing
- Background workers
- Caching
- Memory optimization

Documentation:

```
architecture/17-performance.md
```

---

# Testing Strategy

Testing includes:

- Unit tests
- Integration tests
- End-to-end tests
- Performance tests
- Snapshot tests
- Accessibility tests

Documentation:

```
architecture/18-testing.md
```

---

# Future Architecture

Planned areas include:

- Multi-window workspaces
- Remote development
- Cloud workspaces
- Collaborative editing
- AI agents
- Distributed execution
- Marketplace ecosystem

Documentation:

```
architecture/19-future.md
```

---

# Architecture Principles

1. Prefer composition over inheritance.
2. Favor interfaces over implementations.
3. Keep services stateless where practical.
4. Separate UI from business logic.
5. Use dependency injection.
6. Prefer events over tight coupling.
7. Design for extensibility.
8. Keep APIs backward compatible.
9. Fail gracefully.
10. Optimize only after measurement.

---

# Decision Records

Architecture decisions are tracked separately.

See:

```
docs/DECISIONS.md
docs/adr/
```

---

# Related Documents

- PROJECT_SPEC.md
- ROADMAP.md
- DECISIONS.md
- RELEASES.md
- MILESTONES.md
- CONTRIBUTING.md

---

# Architecture Index

| Document                   | Description                 |
| -------------------------- | --------------------------- |
| 01-system-overview.md      | Overall system architecture |
| 02-monorepo.md             | Repository organization     |
| 03-platform-layer.md       | Core platform services      |
| 04-di.md                   | Dependency Injection        |
| 05-eventbus.md             | Event architecture          |
| 06-ipc.md                  | Electron IPC                |
| 07-workspace.md            | Workspace model             |
| 08-explorer.md             | File explorer               |
| 09-document.md             | Document model              |
| 10-editor.md               | Editor architecture         |
| 11-workbench.md            | Workbench                   |
| 12-extension-host.md       | Extension runtime           |
| 13-vscode-compatibility.md | Compatibility layer         |
| 14-ai-platform.md          | AI architecture             |
| 15-enterprise-platform.md  | Enterprise features         |
| 16-security.md             | Security architecture       |
| 17-performance.md          | Performance                 |
| 18-testing.md              | Testing architecture        |
| 19-future.md               | Future vision               |

---

End of Document
