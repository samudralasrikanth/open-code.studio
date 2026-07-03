# 07. ADR Gap Analysis

This document audits the Architecture Decision Records (ADRs) of Open-Code.Studio. It maps existing ADRs to the Epic catalog, identifies design gaps, and lists the missing ADRs that must be written before starting implementation.

---

## 1. Existing ADR Audit (docs/adr/)

The repository has 15 foundational ADRs:

- `ADR-0001-monorepo` (Approved)
- `ADR-0002-electron` (Approved)
- `ADR-0003-react` (Approved)
- `ADR-0004-typescript` (Approved)
- `ADR-0005-dependency-injection` (Approved)
- `ADR-0006-event-bus` (Approved)
- `ADR-0007-monaco-editor` (Approved)
- `ADR-0008-extension-host` (Approved)
- `ADR-0009-ai-platform` (Approved)
- `ADR-0010-mcp` (Approved)
- `ADR-0011-enterprise-platform` (Approved)
- `ADR-0012-security-model` (Approved)
- `ADR-0013-performance-strategy` (Approved)
- `ADR-0014-testing-strategy` (Approved)
- `ADR-0015-vscode-compatibility` (Approved)

---

## 2. Identified Design Gaps (Missing ADRs)

Four critical architectural areas lack documented decisions. These decisions must be codified before the corresponding milestones begin:

### A. ADR-0016: PtyHost Subprocess Architecture

- **Target Epic:** `EPIC-0007` (Terminal Integration)
- **Status:** **MISSING** (Prerequisite for Milestone 1)
- **Content:** Defines the process isolation strategy for spawning shell terminals, establishing how Electron main processes fork a dedicated utility process running native `node-pty` bindings, and detailing the IPC messaging model between main, utility, and renderer.

### B. ADR-0017: Agent Host Subprocess Isolation Model

- **Target Epic:** `EPIC-0049` - `EPIC-0056` (Agent Platform)
- **Status:** **MISSING** (Prerequisite for Milestone 4)
- **Content:** Outlines how the IDE spawns and manages LLM-driven agents in isolated worker threads or separate OS-level Node.js runtimes. Specifies the IPC protocol, security sandboxing rules, execution timeouts, and resource constraints for agents executing user-generated scripts or commands.

### C. ADR-0018: Yjs Synchronization Topology for Collaboration

- **Target Epic:** `EPIC-0084` - `EPIC-0087` (Collaboration)
- **Status:** **MISSING** (Prerequisite for Milestone 6)
- **Content:** Formally selects the Yjs CRDT model, detailing how shared workspace documents, cursor states, and presence tracks sync over WebSockets. Establishes the conflict resolution strategy, local-first disk persistence during offline operation, and end-to-end security key management.

### D. ADR-0019: Token Engine Offloading & Caching Model

- **Target Epic:** `EPIC-0023` (Token Engine)
- **Status:** **MISSING** (Prerequisite for Milestone 2)
- **Content:** Documents how token counting functions without blocking main/renderer event loops. Specifies loading WASM `tiktoken` dictionaries inside asynchronous Web Worker pools, along with prompt-budget cache retention strategies.

---

## 3. Epic-to-ADR Coverage Matrix

| Epic Group                                        | Primary Existing ADR          | Required New / Updated ADR          |
| ------------------------------------------------- | ----------------------------- | ----------------------------------- |
| **Core Bootstrapping** (`EPIC-0001` - `0003`)     | `ADR-0001`, `ADR-0002`        | None                                |
| **Workspace & Explorer** (`EPIC-0004` - `0005`)   | `ADR-0005`, `ADR-0006`        | None                                |
| **Monaco Editor** (`EPIC-0006`)                   | `ADR-0007`                    | None                                |
| **Terminal Integration** (`EPIC-0007`)            | None                          | **ADR-0016: PtyHost Subprocess**    |
| **Git & Global Search** (`EPIC-0008` / `0010`)    | `ADR-0006` (Event Bus)        | None                                |
| **Local Runtime & Models** (`EPIC-0016` - `0022`) | `ADR-0009` (AI Platform)      | None                                |
| **Token Engine** (`EPIC-0023`)                    | `ADR-0013` (Performance)      | **ADR-0019: Token Offloading**      |
| **Gateway & Providers** (`EPIC-0025` - `0034`)    | `ADR-0010` (MCP integrations) | None                                |
| **Agent Platform** (`EPIC-0049` - `0057`)         | `ADR-0008` (Extension Host)   | **ADR-0017: Agent Host Subprocess** |
| **Workflows** (`EPIC-0058` - `0064`)              | `ADR-0008` (Extension Host)   | None                                |
| **Security & Trust** (`EPIC-0065` - `0070`)       | `ADR-0012` (Security Model)   | None                                |
| **Plugins & Extensions** (`EPIC-0071` - `0076`)   | `ADR-0008` (Extension Host)   | None                                |
| **Enterprise Platform** (`EPIC-0077` - `0083`)    | `ADR-0011` (Enterprise)       | None                                |
| **Collaboration** (`EPIC-0084` - `0087`)          | None                          | **ADR-0018: Yjs Sync Topology**     |
| **Observability** (`EPIC-0093` - `0097`)          | `ADR-0013` (Performance)      | None                                |
| **Future Expansions** (`EPIC-0103` - `0110`)      | `ADR-0015` (VS Code Compat)   | Update `ADR-0015` for WebAssembly   |
