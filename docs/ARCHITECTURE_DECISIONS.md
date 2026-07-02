# Architecture Decisions

This document is the authoritative record of every major architectural decision made in Open-Code.Studio. It exists so that developers and AI agents can understand **why** the code is structured a certain way rather than guessing or reintroducing previously rejected approaches.

New decisions are added in chronological order. Decisions are never deleted — if a decision is reversed, its status changes to `Superseded` and a new entry records the replacement.

---

## Decision Table

| ID                  | Title                                               | Status   | Phase   |
| ------------------- | --------------------------------------------------- | -------- | ------- |
| [ADR-001](#adr-001) | Electron for the desktop shell                      | Accepted | Phase 0 |
| [ADR-002](#adr-002) | PNPM + Turborepo for the monorepo                   | Accepted | Phase 0 |
| [ADR-003](#adr-003) | Event bus for inter-package communication           | Accepted | Phase 0 |
| [ADR-004](#adr-004) | React renderer separated from Desktop Host          | Accepted | Phase 0 |
| [ADR-005](#adr-005) | Strict top-down layer dependency rule               | Accepted | Phase 0 |
| [ADR-006](#adr-006) | Single public entry point per package               | Accepted | Phase 0 |
| [ADR-007](#adr-007) | TypeScript composite builds with project references | Accepted | Phase 0 |
| [ADR-008](#adr-008) | contextBridge as the sole IPC surface               | Accepted | Phase 0 |
| [ADR-009](#adr-009) | Typed IPC channel registry                          | Accepted | Phase 0 |
| [ADR-010](#adr-010) | CSS custom properties for theming                   | Accepted | Phase 0 |
| [ADR-011](#adr-011) | Defer packages/common split to EPIC-0015            | Deferred | Phase 0 |
| [ADR-012](#adr-012) | Workspace packages bundled into Electron main       | Accepted | Phase 0 |
| [ADR-013](#adr-013) | Workspace URI abstraction                           | Accepted | Phase 1 |
| [ADR-014](#adr-014) | Atomic Workspace Persistence Pattern                | Accepted | Phase 1 |

---

## Decisions

---

### ADR-001

**Electron for the desktop shell**

**Status:** Accepted  
**Date:** 2026-07-01  
**Epic:** EPIC-0003

**Decision**

Open-Code.Studio uses [Electron](https://www.electronjs.org/) as the desktop application host.

**Reason**

- Cross-platform support (Windows, macOS, Linux) from a single codebase.
- Mature ecosystem with stable APIs for window management, IPC, native menus, file system access, and system tray integration.
- The renderer is a standard browser context, which means the full web ecosystem (React, CSS, WebAssembly) is available without custom native widget bindings.
- GPU acceleration for the AI inference UI is accessible via Chromium's rendering pipeline.

**Rejected alternatives**

| Alternative                                 | Reason rejected                                                                                                                                                  |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tauri                                       | Smaller runtime footprint but Rust backend increases team language surface. WebView behavior differs across OS versions, creating platform-specific CSS/JS bugs. |
| Native per-platform UI (SwiftUI, WinUI, Qt) | Prohibitively expensive to maintain three separate implementations for a small team.                                                                             |
| Web browser only                            | Cannot access local file system, GPU drivers, local model inference, or native system integration without OS-level permissions not available to browser pages.   |

---

### ADR-002

**PNPM + Turborepo for the monorepo**

**Status:** Accepted  
**Date:** 2026-07-01  
**Epic:** EPIC-0001

**Decision**

The repository uses [PNPM](https://pnpm.io/) for package management and [Turborepo](https://turbo.build/) for task orchestration.

**Reason**

- PNPM's content-addressable store eliminates duplicate packages across workspaces, significantly reducing disk and install time.
- PNPM's strict dependency isolation prevents phantom dependency bugs where a package uses a transitive dependency it did not declare.
- Turborepo's dependency-aware task graph ensures `build` always runs dependencies before dependants without manual ordering.
- Turborepo's local and remote caching makes CI fast: unchanged packages are never rebuilt.
- Both tools have first-class monorepo support with no plugin configuration required.

**Rejected alternatives**

| Alternative    | Reason rejected                                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm workspaces | No task orchestration, no caching, slower installs.                                                                                                             |
| Yarn + Nx      | Nx is more complex to configure and has a steeper learning curve for contributors. Yarn PnP creates compatibility issues with Electron's native module loading. |
| Lerna          | No longer actively maintained as a standalone tool; functionality absorbed by Turborepo and Nx.                                                                 |

---

### ADR-003

**Event bus for inter-package communication**

**Status:** Accepted  
**Date:** 2026-07-01  
**Epic:** EPIC-0002

**Decision**

Packages communicate asynchronously using an event bus (`@ocs/event-bus`) rather than direct function calls across package boundaries.

**Reason**

- Decouples producers from consumers: the runtime package can emit a `model:loaded` event without knowing which packages subscribe.
- Makes it straightforward to add new subscribers (e.g. telemetry, logging) without modifying the emitting package.
- Creates a natural audit trail — all cross-package side effects flow through named, typed events.
- Simplifies testing: packages can be tested in isolation by subscribing to a mock event bus.

**Constraints**

- Events must be typed using the shared event schema in `schemas/events/`.
- Direct imports across non-adjacent layers are still forbidden even when no event is involved. The event bus does not replace the layer dependency rule — it complements it.

---

### ADR-004

**React renderer separated from Desktop Host**

**Status:** Accepted  
**Date:** 2026-07-01  
**Epic:** EPIC-0003

**Decision**

The React UI renderer lives in its own Vite build target (`src/renderer/`) and communicates with the Electron main process exclusively through a typed IPC bridge. The Desktop Host (`src/main/`) does not import React or any renderer code.

**Reason**

- Enforces a hard boundary: the renderer cannot access Node.js APIs or Electron internals directly, which is the primary Electron security requirement.
- Allows the renderer to be developed and hot-reloaded independently of the main process.
- The Desktop Host can be replaced or extended (e.g. with a secondary Electron window or a headless process) without touching the React code.
- Enables future unit testing of the renderer in a pure browser environment using Vitest with jsdom.

---

### ADR-005

**Strict top-down layer dependency rule**

**Status:** Accepted  
**Date:** 2026-07-01  
**Epic:** EPIC-0001

**Decision**

Dependencies between packages flow strictly downward through the layer hierarchy. No lower-layer package may import from a higher-layer package.

```text
Application  →  Agent  →  Knowledge  →  Gateway  →  Runtime  →  Platform Services
```

This rule is enforced by `scripts/validate-architecture.mjs` (package.json level) and `scripts/check-dependencies.mjs` (source import level), and runs in the validate gate before every build.

**Reason**

- Prevents circular dependency chains that make incremental builds unpredictable.
- Ensures platform services remain reusable across multiple applications without any application-level coupling.
- Makes the system topology explicit: any developer can determine how information flows by looking at the layer diagram.

**Enforcement**

A violation causes `pnpm validate` to fail with a clear error message identifying the violating package and import.

---

### ADR-006

**Single public entry point per package**

**Status:** Accepted  
**Date:** 2026-07-01  
**Epic:** EPIC-0001

**Decision**

Every package exposes exactly one public API surface: `src/index.ts`. No other file in the package may be imported by code outside the package.

**Reason**

- Makes refactoring safe: internal file moves and renames never break consumers.
- Forces explicit API design: anything that should be public must be deliberately re-exported from `src/index.ts`.
- The architecture validator (`validate-architecture.mjs`) can reliably determine public APIs because there is only one export file per package.
- Prevents the "reach inside the package" anti-pattern that leads to invisible coupling between packages.

**Rule in CONTRIBUTING.md**

> Never import another package's internal files. If you need something that is not in `src/index.ts`, promote it to the public API.

---

### ADR-007

**TypeScript composite builds with project references**

**Status:** Accepted  
**Date:** 2026-07-01  
**Epic:** EPIC-0001

**Decision**

All packages use TypeScript `composite: true` and are linked via `references` in `tsconfig.json`. The root `tsconfig.json` references all packages.

**Reason**

- TypeScript only recompiles packages that changed, making incremental builds dramatically faster in large monorepos.
- Project references enforce build order: TypeScript will error if a package references a package that has not been built yet.
- Declaration maps (`declarationMap: true`) allow IDE go-to-definition to navigate to the original source TypeScript rather than compiled `.d.ts` files.

---

### ADR-008

**contextBridge as the sole IPC surface**

**Status:** Accepted  
**Date:** 2026-07-01  
**Epic:** EPIC-0003

**Decision**

All communication from the React renderer to the Electron main process goes through the `contextBridge` API exposed in `src/preload/preload.ts`. The renderer has no direct access to `ipcRenderer`, Node.js, or Electron APIs.

**Reason**

- Electron's threat model assumes the renderer process may be compromised by malicious content. The context bridge is the security boundary.
- The preload script is the explicit contract between renderer and host: adding a new capability requires a deliberate change to `preload.ts`, not an ad-hoc `ipcRenderer.invoke` call from anywhere in the React code.
- The typed `window.ocs` API surface is discoverable and auditable in a single file.

**Enforcement**

`contextIsolation: true` and `nodeIntegration: false` are set on every `BrowserWindow.webPreferences`.

---

### ADR-009

**Typed IPC channel registry**

**Status:** Accepted  
**Date:** 2026-07-01  
**Epic:** EPIC-0003

**Decision**

All IPC channel names are declared as constants in `src/shared/ipc-channels.ts`, which is imported by both the main process handler registration and the preload script. No channel string may be hardcoded anywhere else.

**Reason**

- Eliminates the category of bug where a channel string is misspelled in the renderer but the main process handler silently never receives the message.
- A channel rename is a single-file change that TypeScript enforces at every call site.
- The shared file serves as human-readable documentation of every IPC capability the application exposes.

---

### ADR-010

**CSS custom properties for theming**

**Status:** Accepted  
**Date:** 2026-07-01  
**Epic:** EPIC-0003

**Decision**

The theme system uses CSS custom properties (variables) scoped to `[data-theme="dark"]` and `[data-theme="light"]` attributes on the `<html>` element. The `ThemeProvider` React component sets this attribute on theme changes and persists the selection via IPC.

**Reason**

- Theme switching does not require a JavaScript re-render of the entire component tree; the browser applies the new token values immediately.
- Custom properties are inherited, so any component that uses `var(--color-bg-primary)` automatically responds to theme changes without any component-level wiring.
- No runtime style injection: all variables are defined in the static `global.css` file, which satisfies the CSP `style-src 'self'` header.
- Future themes (high contrast, custom user themes) require only a new `[data-theme="X"]` block in CSS with no JavaScript changes.

---

### ADR-011

**Defer packages/common split to EPIC-0015**

**Status:** Deferred  
**Date:** 2026-07-01  
**Epic:** N/A — future

**Decision**

The sub-modules currently under `packages/common` (DI, logging, config, events, errors, lifecycle, telemetry) will eventually be split into separate focused packages under a `packages/core/` namespace. This split is deferred until approximately EPIC-0015.

**Reason for deferral**

- Premature extraction introduces packaging and dependency overhead before the APIs are stable.
- `packages/common` is not yet large enough to present an ownership problem.
- The split will be straightforward because each sub-module already has its own subdirectory (`packages/common/di/`, `packages/common/logger/`, etc.) and is independently exported via `@ocs/common/di`, `@ocs/common/logger`, etc.

**Trigger for reconsideration**

When `packages/common` accumulates responsibilities that clearly belong to different domains, or when two packages need to depend on `common` subsets that would cause circular references.

---

### ADR-012

**Workspace packages bundled into Electron main process**

**Status:** Accepted  
**Date:** 2026-07-02  
**Epic:** EPIC-0003

**Decision**

`@ocs/common` and other workspace packages are bundled directly into the Electron main process bundle by `electron-vite`, rather than being externalized and loaded as Node.js modules at runtime.

**Reason**

- Workspace packages are TypeScript source — they have no pre-built CJS `dist/` at dev time. Externalizing them requires running `tsc` on dependencies before starting the dev server, breaking the fast-start developer experience.
- Bundling eliminates the `ERR_PACKAGE_PATH_NOT_EXPORTED` class of runtime errors that occur when Electron's CJS loader tries to require an ESM-only package.
- The bundle size overhead is negligible for platform service packages (< 50 KB).

**Implementation**

`externalizeDepsPlugin({ exclude: ['@ocs/common'] })` in `electron.vite.config.ts`, combined with a path alias pointing directly to the TypeScript source.

---

### ADR-013

**Workspace URI abstraction**

**Status:** Accepted  
**Date:** 2026-07-02  
**Epic:** EPIC-0004

**Decision**

All paths in the Workspace domain must use a branded `WorkspaceUri` string rather than raw file paths. The system provides `uriFromPath` and `uriToPath` converters.

**Reason**

- By abstracting paths to URIs (e.g. `file:///path`), the IDE can seamlessly support future remote workspaces like `ssh://`, `docker://`, or `cloud://` without changing the domain logic.
- A branded type prevents accidental mixing of raw strings and verified URIs in the type system.

---

### ADR-014

**Atomic Workspace Persistence Pattern**

**Status:** Accepted  
**Date:** 2026-07-02  
**Epic:** EPIC-0004

**Decision**

Persistence for workspace configurations and recent registries uses an atomic write-then-rename pattern via `IStorageAdapter`, writing to a `.tmp` file and then executing `fs.rename`.

**Reason**

- Node.js `fs.writeFile` is not atomic. If the IDE crashes or loses power during a write, a partially written JSON file corrupts the user's workspace history.
- The POSIX `rename` operation (and its Windows equivalent via `MoveFileEx`) guarantees atomic replacement of the target file.
- The IDE will silently recreate state if the file does not exist, but failing due to a corrupted file from a non-atomic write creates a bad user experience.
