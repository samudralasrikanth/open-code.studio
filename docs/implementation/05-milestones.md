# 05. Milestones

This document details the engineering milestones for building Open-Code.Studio. Effort is estimated in **Ideal Engineering Weeks (IEW)** and **Story Points (SP)** (1 SP ≈ 1 Ideal Engineering Day).

---

## Milestone 1: Core Developer Workbench

_Goal:_ Build a fast, local, extensible code editing layout supporting workspace structures, file tabs, and interactive PTY terminals.

- **Associated Epics:**
  - `EPIC-0001` to `EPIC-0003` (Core Bootstrapping - Done)
  - `EPIC-0004` Workspace Management (Must - 2 Weeks / 10 SP)
  - `EPIC-0005` Explorer Platform (Must - 2 Weeks / 10 SP)
  - `EPIC-0006` Document & Editor Platform (Must - 3 Weeks / 15 SP)
  - `EPIC-0007` Terminal Integration (Must - 3 Weeks / 15 SP)
  - `EPIC-0008` Git Integration (Must - 2 Weeks / 10 SP)
  - `EPIC-0009` Command Palette (Must - 2 Weeks / 10 SP)
  - `EPIC-0010` Global Search (Must - 2 Weeks / 10 SP)
  - `EPIC-0011` Settings (Must - 1 Week / 5 SP)
  - `EPIC-0015` Session Restore (Must - 2 Weeks / 10 SP)
- **Total Points:** 95 SP
- **Total Estimated Effort:** **19 Weeks**

---

## Milestone 2: Offline-First Local AI Runtime & Gateway

_Goal:_ Implement local model registration, background context tokenization without blocking the UI, and multi-provider routing gateway.

- **Associated Epics:**
  - `EPIC-0016` Runtime Service (Must - 2 Weeks / 10 SP)
  - `EPIC-0017` Model Registry (Must - 1 Week / 5 SP)
  - `EPIC-0021` Memory Manager (Must - 2 Weeks / 10 SP)
  - `EPIC-0022` Context Manager (Must - 2 Weeks / 10 SP)
  - `EPIC-0023` Token Engine (Must - 4 Weeks / 20 SP)
  - `EPIC-0025` Gateway Core (Must - 3 Weeks / 15 SP)
  - `EPIC-0026` Provider SDK (Must - 1 Week / 5 SP)
  - `EPIC-0027` Local Provider (Must - 2 Weeks / 10 SP)
  - `EPIC-0028` Cloud Provider (Must - 1 Week / 5 SP)
  - `EPIC-0033` Streaming Platform (Must - 2 Weeks / 10 SP)
- **Total Points:** 100 SP
- **Total Estimated Effort:** **20 Weeks**

---

## Milestone 3: Semantic Knowledge Graph & Memory Store

_Goal:_ Parse files on disk to build a type-safe dependency graph and query local vector memory for RAG lookups.

- **Associated Epics:**
  - `EPIC-0035` Workspace Scanner (Should - 2 Weeks / 10 SP)
  - `EPIC-0036` File Watcher (Should - 1 Week / 5 SP)
  - `EPIC-0037` Language Parsers (Should - 4 Weeks / 20 SP)
  - `EPIC-0038` Symbol Extraction (Should - 3 Weeks / 15 SP)
  - `EPIC-0039` Dependency Graph (Should - 4 Weeks / 20 SP)
  - `EPIC-0044` Memory Store (Should - 2 Weeks / 10 SP)
  - `EPIC-0047` Memory Retrieval (Should - 2 Weeks / 10 SP)
- **Total Points:** 90 SP
- **Total Estimated Effort:** **18 Weeks**

---

## Milestone 4: Isolated AI Agent Platform

_Goal:_ Run Planner, Coder, and Reviewer sub-agents in sandboxed OS utility processes and execute self-healing execution loops.

- **Associated Epics:**
  - `EPIC-0049` Agent Registry (Must - 2 Weeks / 10 SP)
  - `EPIC-0050` Planner Agent (Must - 4 Weeks / 20 SP)
  - `EPIC-0051` Coding Agent (Must - 8 Weeks / 40 SP)
  - `EPIC-0052` Review Agent (Must - 3 Weeks / 15 SP)
  - `EPIC-0053` Testing Agent (Must - 3 Weeks / 15 SP)
  - `EPIC-0058` Workflow Core (Must - 4 Weeks / 20 SP)
- **Total Points:** 120 SP
- **Total Estimated Effort:** **24 Weeks**

---

## Milestone 5: Enterprise Governance & Plugin SDK

_Goal:_ Enforce local organization policies and security access rules, and mount third-party plug-ins in runtime sandboxes.

- **Associated Epics:**
  - `EPIC-0065` Policy Engine (Should - 2 Weeks / 10 SP)
  - `EPIC-0066` RBAC (Should - 3 Weeks / 15 SP)
  - `EPIC-0068` Secret Management (Should - 2 Weeks / 10 SP)
  - `EPIC-0071` Plugin SDK (Should - 4 Weeks / 20 SP)
  - `EPIC-0072` Extension Loader (Should - 10 Weeks / 50 SP)
  - `EPIC-0077` Enterprise Authentication (Should - 4 Weeks / 20 SP)
- **Total Points:** 125 SP
- **Total Estimated Effort:** **25 Weeks**

---

## Milestone 6: Distributed Expansion & Remote Runtimes

_Goal:_ Support headless execution, SSH environments, public APIs, and compile the workspace inside browser and mobile engines.

- **Associated Epics:**
  - `EPIC-0105` Remote Runtime (Nice to Have - 10 Weeks / 50 SP)
  - `EPIC-0107` Public API (Nice to Have - 4 Weeks / 20 SP)
  - `EPIC-0103` Browser IDE (Nice to Have - 16 Weeks / 80 SP)
  - `EPIC-0106` Mobile Companion (Nice to Have - 8 Weeks / 40 SP)
  - `EPIC-0110` Distributed Multi-Agent Platform (Research - 36 Weeks / 180 SP)
- **Total Points:** 370 SP
- **Total Estimated Effort:** **74 Weeks**
