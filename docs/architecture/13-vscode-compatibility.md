# VS Code Compatibility Architecture

> **Document:** `docs/architecture/13-vscode-compatibility.md`
> **Version:** 1.0
> **Status:** Living Document

---

# Purpose

Open Code Studio aims to provide a high degree of compatibility with the Visual Studio Code
extension ecosystem while preserving architectural independence.

Compatibility is achieved through adapter layers rather than by copying VS Code internals.

---

# Goals

- Support the majority of VS Code extensions
- Maintain a stable extension API
- Minimize migration effort for extension authors
- Isolate compatibility logic from core services

---

# Compatibility Strategy

```text
VS Code Extension
        |
        v
Compatibility Layer
        |
        v
Open Code Studio APIs
        |
        v
Platform Services
```

The compatibility layer translates supported VS Code APIs into native platform services.

---

# Compatibility Levels

| Level       | Meaning                      |
| ----------- | ---------------------------- |
| Full        | API behaves the same         |
| Partial     | Minor behavioral differences |
| Unsupported | No implementation available  |

---

# Supported Areas

- Commands
- Workspace APIs
- Window APIs
- Configuration
- Languages
- Diagnostics
- Tree Views
- Webviews (planned)
- Themes

---

# Limited or Deferred Support

- Remote Development
- Proposed APIs
- Experimental VS Code APIs
- Native Electron internals
- Internal VS Code modules

---

# Extension Manifest

The extension manifest is validated for:

- Engine compatibility
- Activation events
- Contribution points
- Permissions

Unsupported contribution points generate warnings.

---

# Adapter Layer

Adapters map VS Code concepts to native services.

Examples:

```text
vscode.workspace
        ↓
Workspace Service

vscode.window
        ↓
Workbench Service

vscode.commands
        ↓
Command Registry
```

---

# Testing

Compatibility testing includes:

- Sample extensions
- Marketplace smoke tests
- API regression suite
- Behavioral comparison

---

# Versioning

Compatibility targets are tied to a documented VS Code API baseline.

Breaking changes require migration guidance.

---

# Future

Planned work:

- Automated compatibility reports
- Marketplace validation
- API coverage dashboard
- Remote extension compatibility

---

# Related Documents

- 12-extension-host.md
- 14-ai-platform.md
- 03-platform-layer.md

---

# Summary

Open Code Studio pursues pragmatic compatibility with the VS Code ecosystem through a dedicated compatibility layer that shields the core architecture from external API evolution while maximizing extension portability.
