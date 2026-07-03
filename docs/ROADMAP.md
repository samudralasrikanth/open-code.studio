# Open-Code.Studio Roadmap

**Version:** 1.0  
**Status:** Living Document  
**Owner:** Open-Code.Studio Core Team

---

# Overview

This roadmap defines the long-term implementation plan for Open-Code.Studio.

It is the authoritative planning document for:

- Product phases
- Epic sequencing
- Platform dependencies
- Implementation priorities

Detailed implementation for each Epic lives under:

```
docs/epics/
```

---

# Product Vision

Open-Code.Studio is an AI-native software engineering platform.

It combines:

- Professional IDE
- AI Engineering
- Enterprise Automation
- Testing Platform
- Workflow Engine

while supporting as much of the VS Code extension ecosystem as is technically and legally feasible.

---

# Development Principles

Every Epic must satisfy:

- Architecture first
- Platform before features
- Dependency Injection
- Event-driven communication
- Strict TypeScript
- Test Coverage ≥ 90%
- `pnpm validate` passes
- Manual verification completed
- Documentation updated
- ADRs updated (where applicable)

---

# Phase 0 — Foundation

**Status:** ✅ Complete

Goal:

Build the engineering foundation of Open-Code.Studio.

---

## EPIC-0001 — Repository Foundation

Status: ✅ Complete

Deliverables

- PNPM Monorepo
- Turborepo
- TypeScript
- CI/CD
- Documentation
- Validation pipeline

---

## EPIC-0002 — Core Platform

Status: ✅ Complete

Deliverables

- Dependency Injection
- Event Bus
- Configuration
- Logging
- Telemetry
- Lifecycle

---

## EPIC-0003 — Desktop Host

Status: ✅ Complete

Deliverables

- Electron Host
- IPC
- Window Manager
- Menu
- Theme
- Diagnostics

---

## EPIC-0004 — Workspace Platform

Status: ✅ Complete

Deliverables

- Workspace lifecycle
- Recent workspaces
- Workspace persistence
- Session restore
- Workspace events

---

## EPIC-0005 — Explorer Platform

Status: ✅ Complete

Deliverables

- Explorer tree
- File watching
- Decorations
- Virtualization
- Explorer service
- Diagnostics

---

## EPIC-0006 — Document & Editor Platform

Status: 🟡 In Progress

Deliverables

- Document Platform
- Editor Platform
- Monaco Integration
- Commands
- Save Pipeline
- Preview Tabs
- Split Editors
- Session Restore

---

# Phase 1 — IDE Platform

Goal:

Transform Open-Code.Studio into a professional IDE.

---

## EPIC-0007 — Workbench Platform

Priority: P0

Deliverables

- Workbench Service
- Layout Manager
- View Containers
- Activity Bar
- Sidebar
- Bottom Panel
- Status Bar
- Theme Service
- Context Keys

Dependencies

- EPIC-0006

---

## EPIC-0008 — Extension Platform Foundation

Priority: P0

Deliverables

- Extension Registry
- Extension Manager
- Extension Host Interface
- Contribution Registry
- Activation Events
- Extension Storage

Dependencies

- EPIC-0007

---

## EPIC-0009 — Command Palette & Keybindings

Priority: P0

Deliverables

- Command Palette
- Keybindings
- Shortcut Registry
- Context-aware Commands
- Recent Commands

Dependencies

- EPIC-0008

---

## EPIC-0010 — Terminal Platform

Priority: P0

Deliverables

- xterm.js
- PTY abstraction
- Terminal Service
- Multiple Terminals
- Split Terminals
- Terminal Restore

Dependencies

- EPIC-0007

---

## EPIC-0011 — Git Platform

Priority: P1

Deliverables

- Repository Discovery
- Git Status
- Commit UI
- Diff Viewer
- Branch Manager
- Decorations

Dependencies

- EPIC-0010

---

## EPIC-0012 — Search Platform

Priority: P1

Deliverables

- File Search
- Text Search
- Replace
- Indexing
- Ignore Rules
- Search Providers

Dependencies

- EPIC-0007

---

## EPIC-0013 — Language Platform

Priority: P1

Deliverables

- LSP Client
- Diagnostics
- Completion
- Hover
- Rename
- Formatting
- Code Actions

Dependencies

- EPIC-0010

---

## EPIC-0014 — Settings Platform

Priority: P1

Deliverables

- Settings UI
- User Settings
- Workspace Settings
- Profiles
- Settings Search
- Theme Settings

Dependencies

- EPIC-0007

---

## EPIC-0015 — VS Code Extension Compatibility

Priority: P1

Deliverables

- VSIX Loader
- Extension Host
- VS Code API Compatibility
- Marketplace Integration
- Extension Sandboxing
- Compatibility Test Suite

Dependencies

- EPIC-0008
- EPIC-0009
- EPIC-0010
- EPIC-0011
- EPIC-0012
- EPIC-0013

---

# Phase 2 — AI Engineering Platform

Goal:

Build AI as a first-class engineering participant.

---

## EPIC-0020 — AI Workspace

- AI Sidebar
- AI Context
- Chat
- Prompt History

---

## EPIC-0021 — Agent Platform

- Agent Registry
- Agent Runtime
- Tool Calling
- Planning
- Memory

---

## EPIC-0022 — Code Intelligence

- Code Generation
- Refactoring
- Review
- Documentation
- Explain Code

---

## EPIC-0023 — AI Workflow Engine

- Multi-step Workflows
- Automation
- Scheduling
- Human Approval

---

## EPIC-0024 — Knowledge Platform

- Vector Store
- RAG
- Repository Understanding
- Context Engine

---

# Phase 3 — Enterprise Platform

Goal:

Enterprise software engineering.

---

## EPIC-0030 — Jira Platform

- Issues
- Boards
- Sprints
- AI Story Generation

---

## EPIC-0031 — Playwright Studio

- Recorder
- AI Test Generation
- Execution
- Reporting

---

## EPIC-0032 — Citrix Automation

- Computer Vision
- Recorder
- Playback
- AI Automation

---

## EPIC-0033 — MCP Platform

- MCP Client
- MCP Server
- Tool Discovery
- Tool Marketplace

---

## EPIC-0034 — DevOps Platform

- GitHub
- Azure DevOps
- GitLab
- Bitbucket

---

# Phase 4 — Collaboration Platform

Goal:

Multi-user engineering.

---

## EPIC-0040 — Shared Workspaces

## EPIC-0041 — Team Agents

## EPIC-0042 — Reviews

## EPIC-0043 — Presence

## EPIC-0044 — Live Collaboration

---

# Phase 5 — Cloud Platform

Goal:

Cloud-native engineering.

---

## EPIC-0050 — Cloud Workspaces

## EPIC-0051 — Remote Execution

## EPIC-0052 — Distributed Agents

## EPIC-0053 — Cloud Builds

## EPIC-0054 — Marketplace

---

# Current Status

| Phase   | Status         |
| ------- | -------------- |
| Phase 0 | ✅ Complete    |
| Phase 1 | 🟡 In Progress |
| Phase 2 | ⏳ Planned     |
| Phase 3 | ⏳ Planned     |
| Phase 4 | ⏳ Planned     |
| Phase 5 | ⏳ Planned     |

---

# Current Milestone

Current Epic

**EPIC-0006 — Document & Editor Platform**

Next Epic

**EPIC-0007 — Workbench Platform**

---

# Long-Term Goal

Open-Code.Studio will become:

> **The AI-native operating system for software engineering.**

Developers should be able to design, build, test, review, automate, deploy, and maintain software from a single unified platform while continuing to leverage the existing developer ecosystem wherever practical.

---

# Roadmap Governance

This roadmap is a living document.

Rules:

- Every new Epic must be added here before implementation.
- Dependencies must be documented before development begins.
- Completed Epics must be marked and linked to their implementation documents.
- Changes that affect sequencing or scope require an Architecture Decision Record (ADR).
