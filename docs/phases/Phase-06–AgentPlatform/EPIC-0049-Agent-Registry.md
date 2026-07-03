# EPIC-0049 — Agent Registry

| Property           | Value                                                                               |
| ------------------ | ----------------------------------------------------------------------------------- |
| Epic ID            | EPIC-0049                                                                           |
| Phase              | Phase 6 — Agent Platform                                                            |
| Status             | 📋 Planned                                                                          |
| Priority           | Critical                                                                            |
| Estimated Duration | 3 Weeks                                                                             |
| Dependencies       | Phase 2 Runtime, Phase 3 Gateway, Phase 4 Knowledge Engine, Phase 5 Memory Platform |
| Blocks             | EPIC-0050 Planner Agent, EPIC-0051 Coding Agent, All Future Agents                  |

---

# 1. Overview

The Agent Registry is the central directory for every AI agent inside Open-Code.Studio.

Rather than hardcoding Planner, Coding, Review, Testing, or Documentation agents, every agent registers itself with the registry.

The registry manages discovery, lifecycle, capabilities, permissions, health, metrics, and communication.

---

# 2. Vision

Provide a plugin-based agent platform where new agents can be installed without changing the core platform.

Supported Agent Types

- Planner
- Coding
- Review
- Testing
- Documentation
- Refactoring
- Debugging
- Custom Agents

---

# 3. Goals

## Functional

- Agent registration
- Discovery
- Lifecycle management
- Health monitoring
- Capability lookup
- Version management
- Agent permissions
- Metrics collection

## Non-Functional

- Extensible
- Event-driven
- Fault tolerant
- Provider independent

---

# 4. Scope

Included

- Agent Registry
- Discovery
- Registration
- Health
- Metrics

Excluded

- Agent execution
- Workflow scheduling

---

# 5. Architecture

```mermaid
flowchart LR

Planner

Coding

Review

Testing

Documentation

↓

Agent Registry

↓

Gateway

↓

Runtime
```

---

# 6. Components

- Agent Registry
- Agent Descriptor
- Capability Registry
- Lifecycle Manager
- Health Manager

---

# 7. Interfaces

```typescript
register();

unregister();

agents();

capabilities();

health();

metrics();
```

---

# 8. IPC

```
agent.register

agent.list

agent.health
```

---

# 9. Commands

```
agent.register
agent.refresh
agent.list
agent.metrics
```

---

# 10. Events

```
agent.registered
agent.removed
agent.updated
agent.healthChanged
```

---

# 11. Stories

- Registry
- Discovery
- Lifecycle
- Health
- Metrics

---

# 12. Tasks

- [ ] Registry
- [ ] Discovery
- [ ] Health
- [ ] Metrics

---

# 13. Metrics

| Metric       | Target  |
| ------------ | ------- |
| Registration | <20 ms  |
| Lookup       | <5 ms   |
| Health Check | <100 ms |

---

# 14. Verification

- Registry operational
- Dynamic registration
- Health monitoring
- Coverage ≥90%

---

# 15. Acceptance Criteria

- Agents register automatically
- Capabilities searchable
- Health visible
- Metrics collected

---

# 16. Risks

- Duplicate registrations
- Version conflicts
- Missing capabilities

---

# 17. Future

- Remote agents
- Marketplace agents
- Distributed registry

---

# 18. Deliverables

- Agent Registry
- Capability Registry
- Lifecycle Manager

---

# 19. Traceability

Requirements

- REQ-AGENT-001

ADR-098 Agent Registry

---

# 20. Changelog

v1.0 Initial Specification
