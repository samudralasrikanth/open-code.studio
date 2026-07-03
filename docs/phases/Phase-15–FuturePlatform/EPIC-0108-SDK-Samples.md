# EPIC-0108 — SDK Samples

| Property           | Value                                      |
| ------------------ | ------------------------------------------ |
| Epic ID            | EPIC-0108                                  |
| Phase              | Phase 15 — Platform Expansion              |
| Status             | 📋 Planned                                 |
| Priority           | Medium                                     |
| Estimated Duration | 2 Weeks                                    |
| Dependencies       | EPIC-0071 Plugin SDK, EPIC-0107 Public API |
| Blocks             | Developer Ecosystem                        |

---

# 1. Overview

SDK Samples provide production-quality reference implementations demonstrating how to build plugins, AI agents, workflows, integrations, and automation using Open-Code.Studio APIs.

The sample catalog accelerates developer onboarding and encourages ecosystem growth.

---

# 2. Vision

Provide a comprehensive sample library similar to Microsoft, Google, and GitHub SDK repositories.

Sample Categories

- Plugin Examples
- AI Agents
- Workflow Templates
- REST API
- CLI Integration
- Authentication
- Webhooks
- Enterprise Integration

---

# 3. Goals

- Reference implementations
- Best practices
- Tutorials
- Templates
- Starter projects
- Documentation

---

# 4. Scope

Included

- Sample Repository
- Templates
- Tutorials
- Documentation

Excluded

- Marketplace assets

---

# 5. Architecture

```mermaid
flowchart LR

SDK

↓

Sample Repository

↓

Tutorials

↓

Developers
```

---

# 6. Components

- Sample Repository
- Template Library
- Tutorial Platform
- Documentation
- Starter Kits

---

# 7. APIs

```typescript
samples();

templates();

tutorials();

download();

search();
```

---

# 8. IPC

```
sdk.samples

sdk.templates
```

---

# 9. Commands

```
sdk.init
sdk.download
sdk.list
```

---

# 10. Events

```
sample.downloaded
template.generated
tutorial.completed
```

---

# 11. Stories

- Sample Library
- Tutorials
- Templates
- Starter Kits
- Documentation

---

# 12. Tasks

- [ ] Sample repository
- [ ] Tutorials
- [ ] Templates
- [ ] Documentation

---

# 13. Performance

| Metric              | Target |
| ------------------- | ------ |
| Sample Download     | <5 sec |
| Template Generation | <2 sec |

---

# 14. Definition of Done

- Sample library complete
- Tutorials published
- Templates validated
- Coverage ≥90%

---

# 15. Acceptance Criteria

- Samples compile
- Tutorials accurate
- Templates reusable
- Documentation complete

---

# 16. Risks

- Outdated samples
- API drift
- Maintenance overhead

---

# 17. Future

- Community samples
- AI-generated templates
- Interactive tutorials

---

# 18. Deliverables

- Sample Repository
- Tutorial Library
- Starter Kits

---

# 19. Traceability

Requirements

- REQ-EXP-011

Related ADRs

- ADR-157 SDK Samples

---

# 20. Changelog

v1.0 Initial Specification
