# Platform Module Template

> Copy this document when creating a new platform module.

---

# Module Name

```
Workspace Platform
```

---

# Purpose

Describe the platform capability provided by this module.

Example:

> Provides reusable workspace services for all applications.

---

# Scope

Included

- Workspace lifecycle
- Configuration
- File watching

Excluded

- UI
- Renderer logic
- Business workflows

---

# Public Interfaces

```ts
IWorkspaceService;

IWorkspaceStorage;

IWorkspaceEvents;
```

---

# Architecture

```
Platform Module

│

├── Interfaces

├── Services

├── Models

├── Events

├── Types

├── Utilities

└── Tests
```

---

# Dependencies

Allowed

- Core Platform
- Shared Utilities
- Logging
- Configuration

Forbidden

- Renderer
- React
- Electron UI
- Feature Packages

---

# Events

Published

```
WorkspaceOpened

WorkspaceClosed

WorkspaceChanged
```

Consumed

```
ConfigurationChanged

ApplicationReady
```

---

# Lifecycle

Initialization

↓

Configuration

↓

Ready

↓

Operational

↓

Shutdown

---

# Performance Requirements

- Lazy initialization
- Minimal memory footprint
- Async operations
- Cached expensive computations

---

# Security Requirements

- Validate inputs
- Respect workspace boundaries
- Least privilege
- No direct secret storage

---

# Testing

Required

- Unit Tests
- Integration Tests
- Failure Scenarios
- Performance Benchmarks (if applicable)

Coverage Target

```
90%
```

---

# Documentation

Each platform module should include:

- README.md
- Public APIs
- Event list
- Dependency diagram
- Architecture notes

---

# Review Checklist

- Clearly defined scope
- Stable public interfaces
- Dependency rules respected
- Event contracts documented
- Tests completed
- Documentation complete

---

End of Template
