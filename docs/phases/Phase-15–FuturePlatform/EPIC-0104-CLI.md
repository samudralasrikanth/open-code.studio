# EPIC-0104 — CLI

| Property           | Value                           |
| ------------------ | ------------------------------- |
| Epic ID            | EPIC-0104                       |
| Phase              | Phase 15 — Platform Expansion   |
| Status             | 📋 Planned                      |
| Priority           | Critical                        |
| Estimated Duration | 4 Weeks                         |
| Dependencies       | Workflow Engine, Agent Platform |
| Blocks             | Public API, SDK Samples         |

---

# 1. Overview

The Open-Code CLI enables developers to access every platform capability from the command line.

It supports scripting, automation, CI/CD integration, agent execution, workflow orchestration, project management, and diagnostics.

---

# 2. Vision

Provide a first-class CLI comparable to GitHub CLI, Azure CLI, and Docker CLI while exposing AI-native capabilities.

Supported Commands

- AI
- Workflow
- Agent
- Project
- Plugin
- Memory
- Prompt
- Organization

---

# 3. Goals

- Cross-platform CLI
- Automation
- Scripting
- Machine-readable output
- Authentication
- Extensibility

---

# 4. Scope

Included

- CLI Core
- Command Registry
- Authentication
- Configuration
- Plugins

Excluded

- Interactive editor

---

# 5. Architecture

```mermaid
flowchart LR

CLI

↓

Command Router

↓

Platform APIs

↓

Runtime

↓

Results
```

---

# 6. Components

- CLI Core
- Command Parser
- Authentication
- Output Formatter
- Plugin Loader

---

# 7. APIs

```typescript
execute();

commands();

login();

config();

extensions();
```

---

# 8. IPC

```
cli.execute

cli.status
```

---

# 9. Commands

```
opencode init
opencode chat
opencode workflow
opencode doctor
```

---

# 10. Events

```
cli.started
command.executed
authentication.completed
```

---

# 11. Stories

- CLI Core
- Authentication
- Commands
- Configuration
- Output

---

# 12. Tasks

- [ ] CLI framework
- [ ] Command parser
- [ ] Configuration
- [ ] Authentication

---

# 13. Performance

| Metric           | Target  |
| ---------------- | ------- |
| Startup          | <150 ms |
| Command Dispatch | <50 ms  |

---

# 14. Definition of Done

- CLI operational
- Commands documented
- Authentication complete
- Coverage ≥90%

---

# 15. Acceptance Criteria

- Commands execute
- Scripts supported
- Output structured
- Authentication works

---

# 16. Risks

- Command compatibility
- Breaking changes
- Plugin conflicts

---

# 17. Future

- AI-assisted shell
- Interactive mode
- Remote CLI

---

# 18. Deliverables

- CLI Core
- Command Framework
- Configuration Manager

---

# 19. Traceability

Requirements

- REQ-EXP-003
- REQ-EXP-004

Related ADRs

- ADR-153 CLI

---

# 20. Changelog

v1.0 Initial Specification
