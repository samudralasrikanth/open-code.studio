# 10. Development Playbook

This document serves as the operational guide for developers and AI agents working on Open-Code.Studio. It defines the step-by-step development process, coding standards, and PR validation requirements.

---

## 1. Interface-First Development Workflow

Every new capability in the platform must follow a strict three-stage development cycle:

### Stage 1: Contract Definition

1. Do not write concrete implementations. Define interfaces first in the corresponding package index or a dedicated `types.ts`.
2. Ensure interfaces use abstract primitives (such as URIs, CancellationTokens, Streams) rather than language-specific runtime details.
3. Review interfaces for dependency circularity.

### Stage 2: Mock & Test Creation

1. Create mock implementations of the defined interfaces.
2. Write unit tests against the interfaces using Vitest.
3. Establish 100% test coverage target for the mocked interface interactions.

### Stage 3: Concrete Implementation

1. Write the concrete adapter or service implementation.
2. Re-run unit and integration tests to verify the concrete class behaves identically to the mock.
3. Write system integrations (e.g. wire IPC paths, mount UI components).

---

## 2. Coding Standards & Guidelines

- **Zero Tolerance for Placeholders:** Never commit `TODO` comments, blank method stubs, or mock implementations into production branches.
- **Strict Decoupling:** Core platform modules must never import from UI packages or application presentation layers.
- **Event-Driven Communications:** Cross-package communication must occur exclusively via the global `EventBus` or commands, never through direct class access across module boundaries.
- **Resource Management:** Every class managing file buffers, watchers, terminal sessions, or websocket connections must implement the `IDisposable` interface:
  ```typescript
  interface IDisposable {
    dispose(): void;
  }
  ```
  Ensure all event listeners are unregistered when disposing.

---

## 3. Pre-Commit Validation Checklist

Before staging or committing code, developers must run the following local command:

```bash
pnpm validate
```

This script executes four checks that must pass with zero warnings:

1. **Linting (`pnpm lint`):** Checks for syntax rules and strict TypeScript compile errors.
2. **Formatting Check (`pnpm format:check`):** Verifies Prettier conformity.
3. **TypeScript Compilation (`pnpm typecheck`):** Compiles the monorepos without emission to verify types.
4. **Unit Tests (`pnpm test`):** Executes all Vitest suites.

---

## 4. PR Criteria for AI Agents

For an AI agent to mark a task as complete, the following deliverables must be met:

- **Build Integrity:** App compiles successfully across macOS, Linux, and Windows.
- **Test Coverage:** Code coverage remains at or above 90% in the modified packages.
- **Documentation Update:** Updated the relevant `walkthrough.md` with test output.
- **Clean Git State:** Staged and committed code with descriptive conventional commit messages.
- **No Unused Code:** Unused imports, unused variables, and stale files must be pruned.
