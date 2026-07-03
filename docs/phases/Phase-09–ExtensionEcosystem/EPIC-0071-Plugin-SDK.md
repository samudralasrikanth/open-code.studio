# EPIC-0071 — Plugin SDK

| Property           | Value                                   |
| ------------------ | --------------------------------------- |
| Epic ID            | EPIC-0071                               |
| Phase              | Phase 9 — Extension Ecosystem           |
| Status             | 📋 Planned                              |
| Priority           | Critical                                |
| Estimated Duration | 4 Weeks                                 |
| Dependencies       | Runtime, Gateway, Policy Engine         |
| Blocks             | EPIC-0072 Extension Loader, Marketplace |

---

# 1. Overview

The Plugin SDK enables third-party developers to extend Open-Code.Studio by building plugins that integrate with the editor, AI platform, workflows, UI, terminals, knowledge engine, and agent platform.

---

# 2. Vision

Provide an extension ecosystem comparable to VS Code while exposing AI-native capabilities unavailable in traditional IDEs.

Plugin Types

- AI Agents
- Commands
- Panels
- Views
- Editors
- Themes
- Workflows
- Language Support
- Tool Providers

---

# 3. Goals

- Stable SDK
- Versioned APIs
- Plugin Manifest
- Sandboxed APIs
- Event System
- Documentation

---

# 4. Scope

Included

- SDK
- Manifest
- APIs
- Events
- Documentation

Excluded

- Marketplace

---

# 5. Architecture

```mermaid
flowchart LR

Plugin

↓

SDK

↓

Extension Loader

↓

Platform APIs

↓

Runtime
```

---

# 6. Components

- SDK Core
- API Surface
- Manifest Parser
- Event API
- Command API

---

# 7. APIs

```typescript
registerCommand();

registerView();

registerAgent();

workspace();

terminal();

events();
```

---

# 8. IPC

```
plugin.register
plugin.commands
```

---

# 9. Commands

```
plugin.install
plugin.enable
plugin.disable
```

---

# 10. Events

```
plugin.loaded
plugin.unloaded
plugin.failed
```

---

# 11. Stories

- SDK Core
- Plugin APIs
- Events
- Commands
- Documentation

---

# 12. Tasks

- [ ] SDK
- [ ] Manifest
- [ ] APIs
- [ ] Samples

---

# 13. Performance

| Metric   | Target  |
| -------- | ------- |
| SDK Load | <100 ms |
| API Call | <5 ms   |

---

# 14. Definition of Done

- SDK documented
- APIs stable
- Samples available
- Coverage ≥90%

---

# 15. Acceptance Criteria

- Plugins compile
- APIs stable
- Versioning supported
- Documentation complete

---

# 16. Risks

- Breaking API changes
- Poor documentation
- Version conflicts

---

# 17. Future

- SDK Generator
- Language bindings
- AI plugin templates

---

# 18. Deliverables

- SDK
- Samples
- Documentation
- Manifest Specification

---

# 19. Traceability

REQ-PLUGIN-001

ADR-120 Plugin SDK

---

# 20. Changelog

v1.0 Initial Specification
