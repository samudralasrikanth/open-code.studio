# Open-Code.Studio

One IDE. Every Model. Zero Vendor Lock-in.

This repository is the production monorepo for Open-Code.Studio. It is organized around platform domains so applications, services, SDKs, and shared packages can evolve together while preserving clear ownership boundaries.

## Requirements

- Node.js 20.11 or newer
- PNPM 9 or newer through Corepack

## Local Setup

```sh
corepack enable
pnpm install
pnpm validate
```

## Common Commands

- `pnpm dev` starts all development tasks that packages expose.
- `pnpm build` builds the workspace through the dependency graph.
- `pnpm test` runs package tests.
- `pnpm test:coverage` runs tests with coverage reporting.
- `pnpm lint` runs static analysis.
- `pnpm format` formats files.
- `pnpm arch:check` validates repository boundaries.
- `pnpm docs:check` validates required documentation.
- `pnpm validate` runs the full local quality gate.

## Repository Layout

```text
apps/       Product surfaces and presentation shells.
packages/   Platform domains, SDKs, shared UI, and common utilities.
services/   Long-running or separately deployable platform services.
tooling/    Build, generation, lint, release, and codegen utilities.
schemas/    API, event, manifest, and configuration schemas.
tests/      Cross-package test suites.
docs/       Repository-level engineering documentation and templates.
scripts/    Automation used by local development and CI.
```

Every workspace package exposes a single public entry point at `src/index.ts` and keeps package documentation versioned beside the code.

## Quality Gates

Pull requests must pass formatting, linting, strict TypeScript checks, tests, architecture validation, documentation validation, and build verification.

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│  Application Layer                                      │
│  apps/studio  apps/browser  apps/cli  apps/enterprise   │
└───────────────────────────┬─────────────────────────────┘
                            │ depends on
┌───────────────────────────▼─────────────────────────────┐
│  Agent Layer              @ocs/agents                   │
│  AI planning, coding, review, testing, documentation    │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Knowledge Layer          @ocs/knowledge                │
│  Context, indexing, embeddings, retrieval               │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Gateway Layer            @ocs/gateway                  │
│  Provider abstraction, routing, rate limiting           │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Runtime Layer            @ocs/runtime                  │
│  Model registry, inference, GPU, memory, quantization   │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Platform Services        @ocs/common                   │
│  DI, logging, config, events, lifecycle, telemetry      │
└─────────────────────────────────────────────────────────┘
```

Dependencies flow strictly downward. No lower layer may import from a higher layer. The architecture validator in `scripts/validate-architecture.mjs` enforces this at every build.

## Status

| Epic      | Name                  | Status      |
| --------- | --------------------- | ----------- |
| EPIC-0001 | Repository Foundation | ✅ Complete |
| EPIC-0002 | Core Platform         | ✅ Complete |
| EPIC-0003 | Desktop Bootstrap     | ✅ Complete |
| EPIC-0004 | Workspace Management  | 🔜 Next     |

AI runtime and product features beyond Phase 0 are intentionally out of scope for this phase.
