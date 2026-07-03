# Extension Host Architecture

> **Document:** `docs/architecture/12-extension-host.md`
> **Version:** 1.0
> **Status:** Living Document

---

# Purpose

The Extension Host provides an isolated runtime for third-party and first-party extensions.
Its primary goals are stability, security, compatibility, and extensibility.

Core application functionality must remain operational even if one or more extensions fail.

---

# Goals

- Process isolation
- Stable extension APIs
- VS Code compatibility where practical
- Secure execution
- Controlled resource usage
- Independent lifecycle

---

# High-Level Architecture

```text
+--------------------+
|   Renderer UI      |
+---------+----------+
          |
          | Extension API
          v
+--------------------+
| Extension Host RPC |
+---------+----------+
          |
          v
+--------------------+
| Extension Runtime  |
+---------+----------+
          |
   +------+------+
   |             |
Language      Commands
Providers      Views
```

---

# Responsibilities

- Discover extensions
- Validate manifests
- Activate extensions
- Expose public APIs
- Execute contributed features
- Deactivate and dispose extensions
- Recover from failures

---

# Lifecycle

```text
Discover
   ↓
Validate
   ↓
Register
   ↓
Activate
   ↓
Running
   ↓
Deactivate
   ↓
Dispose
```

Activation should be lazy whenever possible.

---

# Activation Events

Examples:

- onStartupFinished
- onLanguage:python
- onCommand:workbench.action.build
- onWorkspaceOpen
- onDebug
- onAIRequest (future)

Only matching extensions should activate.

---

# Extension Manifest

Each extension should declare:

- Name
- Version
- Publisher
- Engine compatibility
- Activation events
- Contributions
- Permissions

---

# Contribution Points

Supported contribution types include:

- Commands
- Menus
- Views
- Themes
- Languages
- Snippets
- Debug adapters
- AI tools (future)

---

# API Bridge

Extensions never communicate directly with internal services.

```text
Extension
    |
Public API
    |
RPC Bridge
    |
Platform Services
```

This preserves implementation independence.

---

# Isolation

The Extension Host is isolated from:

- Renderer internals
- Platform implementation classes
- Native operating system APIs

Privileged operations are brokered through validated IPC.

---

# Error Handling

Extension failures:

- Must not crash the IDE
- Must be logged
- May disable only the failing extension
- Should surface actionable diagnostics

---

# Performance

Recommendations:

- Lazy activation
- Timeboxed startup
- Async operations
- Background indexing
- Activation telemetry

Slow extensions should be measurable.

---

# Security

Extensions:

- Run with least privilege
- Request explicit capabilities
- Cannot bypass workspace trust
- Cannot access secrets directly
- Cannot execute privileged IPC without authorization

---

# Testing

Required:

- Activation tests
- API compatibility tests
- Failure isolation tests
- Performance benchmarks
- Contribution validation

---

# Future Evolution

- Extension sandbox hardening
- WASM-based extensions
- Remote extension execution
- Marketplace signing
- Capability-based permissions

---

# Related Documents

- 06-ipc.md
- 10-editor.md
- 11-workbench.md
- 13-vscode-compatibility.md

---

# Summary

The Extension Host enables a rich plugin ecosystem while protecting application stability through isolation, well-defined APIs, lazy activation, and strict security boundaries.
