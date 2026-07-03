# 01. Package Map

This document establishes the package boundaries of the Open-Code.Studio monorepo and maps each Epic group to its target directories.

---

## 1. Directory Structure & Package Roles

The codebase is organized as a pnpm monorepo. It enforces strict separation of concerns, layering application entry points separate from core platform services.

```
open-code.studio/
├── apps/                        # Application entry points & runtimes
│   ├── studio/                  # Electron desktop application (Renderer & Main)
│   ├── browser/                 # Web-only compilation entry point (future)
│   ├── cli/                     # CLI client interface
│   └── enterprise-console/      # Web admin panel for enterprise self-host
│
├── packages/                    # Core platform domain services
│   ├── common/                  # Shared utilities, CRDT helpers, primitives
│   ├── configuration/           # Global setting validation, storage, schemas
│   ├── document/                # Virtual file system document state & cache
│   ├── editor/                  # Layout tree, tab states, split controllers
│   ├── editor-monaco/           # Monaco adapter, model caching, cursor syncing
│   ├── event-bus/               # Event dispatching, publish-subscribe platform
│   ├── explorer/                # File system listing, watcher hooks, explorer UI
│   ├── gateway/                 # LLM provider routing, caching, API keys
│   ├── knowledge/               # tree-sitter parsers, AST extraction, dependency graphs
│   ├── memory/                  # Vector databases, sqlite indexer, semantic memory
│   ├── policy/                  # RBAC engine, policy rules, sandbox policies
│   ├── runtime/                 # Native execution, PTY hosts, terminal state
│   ├── sdk-agent/               # API contracts & execution harness for agents
│   ├── sdk-plugin/              # Interfaces for user-contributed plugins
│   ├── sdk-provider/            # Interfaces for LLM engine integrations
│   ├── sdk-workflow/            # Schemas & execution states for pipelines
│   ├── telemetry/               # OpenTelemetry wrappers, metrics, tracing logs
│   ├── ui/                      # Shared component design system
│   └── workflow/                # Workflow execution runner & history store
```

---

## 2. Epic-to-Package Mapping Matrix

Every Epic must have a clear codebase owner package. Developers must not scatter domain logic across unrelated packages.

| Phase                       | Epic Range                | Package/App Owner                             | Primary Directory                                 | Scope Description                                                |
| --------------------------- | ------------------------- | --------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| **Phase 0: Foundation**     | `EPIC-0001` - `EPIC-0003` | `apps/studio`                                 | `apps/studio/src/main`                            | Bootstrapping the main Electron process, window, and bundlers.   |
| **Phase 1: IDE Platform**   | `EPIC-0004`               | `packages/workspace`                          | `packages/workspace/src`                          | Directory mounting, workspace metadata, and file resolution.     |
|                             | `EPIC-0005`               | `packages/explorer`                           | `packages/explorer/src`                           | Tree structures, file matching, file/folder tree logic.          |
|                             | `EPIC-0006`               | `packages/document` & `packages/editor`       | `packages/document/src` & `packages/editor/src`   | Decoupled state management for open buffers and layout nodes.    |
|                             | `EPIC-0007`               | `packages/runtime` & `apps/studio`            | `packages/runtime/src/terminal`                   | Local shell spawning, xterm rendering, PTY host adapters.        |
|                             | `EPIC-0008`               | `packages/workspace` (git module)             | `packages/workspace/src/git`                      | Git diff calculations, stage/commit bindings, file tracking.     |
|                             | `EPIC-0009`               | `apps/studio` (renderer)                      | `apps/studio/src/renderer/src/components/palette` | Palette UI, execution registry, shortcut listeners.              |
|                             | `EPIC-0010`               | `packages/workspace` (search module)          | `packages/workspace/src/search`                   | Ripgrep wrappers, multi-file content indexing and matching.      |
|                             | `EPIC-0011` - `EPIC-0012` | `packages/configuration` & `packages/ui`      | `packages/configuration/src`                      | Schema validation, storage mapping, custom theme stylesheets.    |
|                             | `EPIC-0013` - `EPIC-0015` | `apps/studio` & `packages/common`             | `packages/common/src`                             | Notifications, shortcut registrations, layout serialization.     |
| **Phase 2: Runtime**        | `EPIC-0016` - `EPIC-0024` | `packages/runtime`                            | `packages/runtime/src`                            | Native process wrappers, execution diagnostics, token counters.  |
| **Phase 3: Gateway**        | `EPIC-0025` - `EPIC-0034` | `packages/gateway`                            | `packages/gateway/src`                            | LLM API routing, client SDK integrations, credential management. |
| **Phase 4: Knowledge**      | `EPIC-0035` - `EPIC-0043` | `packages/knowledge`                          | `packages/knowledge/src`                          | Tree-sitter parsers, symbol databases, AST relation indexer.     |
| **Phase 5: Memory**         | `EPIC-0044` - `EPIC-0048` | `packages/memory`                             | `packages/memory/src`                             | SQLite tables, local vector stores, user preference records.     |
| **Phase 6: Agents**         | `EPIC-0049` - `EPIC-0057` | `packages/agents` & `packages/sdk-agent`      | `packages/agents/src`                             | Planning pipelines, editing agents, agent evaluation stubs.      |
| **Phase 7: Workflows**      | `EPIC-0058` - `EPIC-0064` | `packages/workflow` & `packages/sdk-workflow` | `packages/workflow/src`                           | Step runner engine, transaction states, analytics trackers.      |
| **Phase 8: Security**       | `EPIC-0065` - `EPIC-0070` | `packages/policy`                             | `packages/policy/src`                             | RBAC maps, trust validations, token verification.                |
| **Phase 9: Extensions**     | `EPIC-0071` - `EPIC-0076` | `packages/sdk-plugin` & `apps/studio`         | `packages/sdk-plugin/src`                         | Extension lifecycle, isolated sandboxing, host messaging.        |
| **Phase 10: Enterprise**    | `EPIC-0077` - `EPIC-0083` | `apps/enterprise-console`                     | `apps/enterprise-console/src`                     | SSO login flows, audit logs, licensing endpoints.                |
| **Phase 11: Collaboration** | `EPIC-0084` - `EPIC-0087` | `packages/common` (collab module)             | `packages/common/src/collab`                      | Yjs syncing, presence tracking, workspace synchronization.       |
| **Phase 12: AI Quality**    | `EPIC-0088` - `EPIC-0092` | `packages/agents` (eval module)               | `packages/agents/src/evals`                       | Evals test runs, prompt versioning systems.                      |
| **Phase 13: Metrics**       | `EPIC-0093` - `EPIC-0097` | `packages/telemetry`                          | `packages/telemetry/src`                          | OpenTelemetry configurations, metrics buffers, log collectors.   |
| **Phase 14: DevOps**        | `EPIC-0098` - `EPIC-0102` | `apps/studio` (updater module)                | `apps/studio/src/main/updater`                    | Build config scripts, update handlers, crash dumps.              |
| **Phase 15: Expansion**     | `EPIC-0103` - `EPIC-0110` | `apps/browser` & `apps/cli`                   | `apps/browser/src` & `apps/cli/src`               | Remote terminals, WebAssembly runtime compilation, mobile app.   |

---

## 3. Core Placement Rules

To avoid circular dependencies, the compilation pipeline enforces the following import rules:

1. **Leaf Packages** (`packages/common`, `packages/event-bus`, `packages/telemetry`) must not import from any other package in the monorepo.
2. **Platform Services** (`packages/workspace`, `packages/document`, `packages/editor`, `packages/runtime`) may import from leaf packages, but must not import from UI packages or application shells.
3. **Monaco Adapters** (`packages/editor-monaco`) may import from `packages/editor` and `packages/document`, but not vice-versa.
4. **Agent/Workflow SDKs** must remain lightweight, holding only interfaces and schemas. They must never import from concrete implementations (`packages/agents` or `packages/workflow`).
5. **App Shells** (`apps/studio`) function as the composition root, integrating all packages and setting up dependency injection bindings.
