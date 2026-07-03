# Document Precedence & Pre-Flight Architecture Freeze

This document formalizes the authority levels of all documentation in Open-Code.Studio, establishes the v1.0 Architecture Freeze, and outlines the change control process.

---

## 1. Documentation Hierarchy & Precedence

When two documents contain conflicting statements, the conflict is resolved by applying the following order of precedence (Level 1 holds the highest authority):

| Level        | Document Type                            | Scope & Authority                                        | Location               |
| ------------ | ---------------------------------------- | -------------------------------------------------------- | ---------------------- |
| **Level 1**  | **Architecture Decision Records (ADRs)** | Canonical system design decisions; highest authority.    | `docs/adr/`            |
| **Level 2**  | **System Architecture Guides**           | High-level system descriptions and cross-cutting specs.  | `docs/architecture/`   |
| **Level 3**  | **Product & Project Specifications**     | Living specification of product scope and core rules.    | `docs/PROJECT_SPEC.md` |
| **Level 4**  | **Interface Specifications**             | Typed language-neutral contracts for core services.      | `docs/interfaces/`     |
| **Level 5**  | **Package Specifications (READMEs)**     | Structural READMEs detailing package scopes and imports. | `packages/*/README.md` |
| **Level 6**  | **Epics**                                | Feature descriptions, scopes, and target phases.         | `docs/phases/`         |
| **Level 7**  | **Stories**                              | Story checklists detailing exact feature goals.          | `docs/stories/`        |
| **Level 8**  | **Tasks**                                | Todo checklists outlining discrete code steps.           | `docs/tasks/`          |
| **Level 9**  | **Walkthroughs**                         | Post-implementation walkthrough summaries and diffs.     | `docs/walkthrough.md`  |
| **Level 10** | **Generated Reports & Blueprints**       | Derived planning maps (regenerated automatically).       | `docs/implementation/` |

- **Normative Sources (Level 1–5):** The source of truth for implementation logic. Any deviation from these requires an official ADR.
- **Informative Sources (Level 6–10):** Implementation guides, walkthroughs, and generated reports designed to assist development but secondary to the core contracts.

---

## 2. Architecture Freeze (v1.0.0)

| Attribute                | Value             |
| ------------------------ | ----------------- |
| **Architecture Version** | v1.0.0            |
| **Frozen**               | YES               |
| **Effective Date**       | 2026-07-03        |
| **Next Review**          | After Milestone 1 |

No further architectural design or documentation updates are permitted without going through the formal Change Control process. Coding and feature implementation for Milestone 1 are authorized to begin under these specs.

---

## 3. Change Control Process

If implementation or testing reveals a necessary change to a Level 1–5 document, developers must:

1. **Submit an ADR Proposal:** Create a new draft in `docs/adr/ADR-XXXX-proposal.md`.
2. **Architecture Review:** Conduct a peer review evaluating the impact of the proposed change on monorepo package dependency rules, resource budgets, and trust boundaries.
3. **Compatibility Analysis:** Conduct a comprehensive analysis of affected packages, APIs, IPC endpoints, events, tests, and documentation.
4. **Draft a Migration Plan:** Include steps to refactor existing code, resolve interface mismatches, and maintain backward compatibility.
5. **Approve & Commit:** Once approved by the core team, merge the ADR, update the corresponding Level 2–5 documentation, and execute the migration plan.
