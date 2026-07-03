# Open-Code.Studio — Architecture Decision Record (ADR) Index

**Version:** 1.0  
**Status:** Living Document

---

# Purpose

This document is the central index of all Architecture Decision Records (ADRs) for Open-Code.Studio.

Each ADR records a significant architectural decision, why it was made, alternatives considered, and its long-term implications.

When a design decision affects multiple packages, introduces a new platform, or changes architecture, an ADR must be created.

---

# ADR Status

| Status     | Meaning                  |
| ---------- | ------------------------ |
| Proposed   | Under discussion         |
| Accepted   | Approved and implemented |
| Superseded | Replaced by another ADR  |
| Deprecated | No longer recommended    |

---

# ADR Index

| ADR     | Title                             | Status   | Epic      |
| ------- | --------------------------------- | -------- | --------- |
| ADR-001 | Monorepo Architecture             | Accepted | EPIC-0001 |
| ADR-002 | Turborepo Build Pipeline          | Accepted | EPIC-0001 |
| ADR-003 | Strict TypeScript Configuration   | Accepted | EPIC-0001 |
| ADR-004 | Dependency Injection Container    | Accepted | EPIC-0002 |
| ADR-005 | Event-Driven Platform             | Accepted | EPIC-0002 |
| ADR-006 | Structured Logging                | Accepted | EPIC-0002 |
| ADR-007 | Lifecycle Management              | Accepted | EPIC-0002 |
| ADR-008 | Electron Main Process Boundary    | Accepted | EPIC-0003 |
| ADR-009 | Secure IPC Architecture           | Accepted | EPIC-0003 |
| ADR-010 | Workspace Domain Isolation        | Accepted | EPIC-0004 |
| ADR-011 | Workspace State Machine           | Accepted | EPIC-0004 |
| ADR-012 | JSON Workspace Persistence        | Accepted | EPIC-0004 |
| ADR-013 | Workspace URI Abstraction         | Accepted | EPIC-0004 |
| ADR-014 | Atomic Workspace Persistence      | Accepted | EPIC-0004 |
| ADR-015 | Vite Workspace Package Resolution | Accepted | EPIC-0005 |
| ADR-016 | Virtual Explorer Tree             | Accepted | EPIC-0005 |
| ADR-017 | File Watcher Architecture         | Accepted | EPIC-0005 |
| ADR-018 | Explorer Provider Model           | Accepted | EPIC-0005 |
| ADR-019 | Document Platform                 | Accepted | EPIC-0006 |
| ADR-020 | Editor Platform                   | Accepted | EPIC-0006 |
| ADR-021 | Monaco as Infrastructure Adapter  | Accepted | EPIC-0006 |
| ADR-022 | Command Platform                  | Accepted | EPIC-0006 |
| ADR-023 | Flush Strategy                    | Accepted | EPIC-0006 |
| ADR-024 | Workspace Restore via Event Bus   | Accepted | EPIC-0006 |
| ADR-025 | ModelManager Pattern              | Accepted | EPIC-0006 |
| ADR-026 | VS Code Compatibility Strategy    | Accepted | Phase 1   |

---

# Future ADRs

Reserved IDs

ADR-027 Extension Host

ADR-028 VSIX Loader

ADR-029 Workbench Platform

ADR-030 Terminal Platform

ADR-031 Git Platform

ADR-032 Search Platform

ADR-033 Language Platform

ADR-034 AI Platform

ADR-035 Agent Platform

ADR-036 Workflow Engine

ADR-037 Knowledge Platform

ADR-038 Cloud Workspaces

ADR-039 Collaboration Platform

ADR-040 Security Model

---

# ADR Template

Every ADR should contain:

- Title
- Context
- Decision
- Alternatives
- Consequences
- Status
- Related Epic
- Related Packages

---

# Governance Rules

An ADR is required when:

- Introducing a new platform
- Changing architecture
- Breaking compatibility
- Introducing new infrastructure
- Changing package boundaries
- Changing public APIs
- Changing persistence models

Minor implementation details do not require ADRs.

---

# Ownership

Architecture decisions are reviewed before implementation.

Accepted ADRs become part of the permanent engineering specification.
