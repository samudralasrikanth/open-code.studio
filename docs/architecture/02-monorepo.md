# Monorepo Architecture

> **Document:** `docs/architecture/02-monorepo.md`
> **Version:** 1.0
> **Status:** Living Document

---

# Purpose

This document defines how the Open Code Studio source code is organized.

The monorepo is designed to:

- Enable independent package development
- Maximize code reuse
- Prevent architectural drift
- Support incremental builds
- Improve testability
- Allow multiple applications to share a common platform

---

# Goals

The repository should:

- Scale to hundreds of packages
- Support multiple desktop applications
- Support shared platform libraries
- Support extension development
- Minimize duplicated code
- Enable isolated testing
- Enable incremental CI/CD

---

# Repository Layout

```text
open-code.studio/

├── apps/
│
├── packages/
│
├── extensions/
│
├── tools/
│
├── docs/
│
├── scripts/
│
├── configs/
│
├── examples/
│
├── benchmarks/
│
├── tests/
│
└── .github/
```

Every directory has a clearly defined responsibility.

---

# Top-Level Directories

## apps/

Contains executable applications.

Example:

```text
apps/

    studio/

    extension-host/

    updater/
```

Applications compose packages but should contain very little business logic.

---

## packages/

Contains reusable libraries.

Examples:

```text
packages/

    platform/

    workspace/

    editor/

    explorer/

    ai/

    git/

    telemetry/

    configuration/

    ui/

    common/
```

Packages should be reusable by any application.

---

## extensions/

Contains built-in extensions.

Examples:

```text
extensions/

    markdown/

    json/

    git/

    python/

    themes/

    ai/
```

Extensions should communicate through public extension APIs.

---

## tools/

Developer tooling.

Examples:

```text
tools/

    generators/

    build/

    release/

    lint/

    migration/
```

---

## docs/

Project documentation.

Includes:

- Architecture
- ADRs
- API Guidelines
- Standards
- Roadmaps

---

## configs/

Shared configuration.

Examples:

```text
eslint

prettier

typescript

vitest

playwright
```

Configuration should not be duplicated across packages.

---

# Package Categories

Packages fall into several categories.

## Platform Packages

Provide reusable infrastructure.

Examples:

```text
platform

configuration

logging

storage

workspace

filesystem
```

---

## Feature Packages

Provide user-facing capabilities.

Examples:

```text
editor

explorer

search

git

terminal

debug
```

---

## UI Packages

Contain reusable components.

Examples:

```text
buttons

dialogs

layout

icons

theme
```

UI packages must not contain business logic.

---

## Common Packages

Contain shared utilities.

Examples:

```text
events

types

errors

collections

utils
```

---

# Dependency Rules

Dependency direction is strictly controlled.

```text
Apps

↓

Features

↓

Platform

↓

Common
```

Reverse dependencies are prohibited.

---

# Allowed Dependencies

| Package  | May Depend On              |
| -------- | -------------------------- |
| Apps     | Features, Platform, Common |
| Features | Platform, Common           |
| Platform | Common                     |
| Common   | None                       |

---

# Forbidden Dependencies

Examples:

❌

```text
platform → editor
```

❌

```text
common → workspace
```

❌

```text
ui → electron-main
```

Circular dependencies are never allowed.

---

# Package Structure

Every package should follow a consistent layout.

```text
package/

src/

tests/

README.md

CHANGELOG.md

package.json

tsconfig.json
```

---

# Source Layout

```text
src/

index.ts

services/

interfaces/

events/

models/

types/

utils/

constants/

internal/
```

Only `index.ts` defines the public API.

---

# Public API

Public exports should be intentional.

Example:

```ts
export * from "./services";
export * from "./interfaces";
```

Never export internal implementation details.

---

# Internal Modules

Implementation details belong inside:

```text
internal/
```

These modules must not be imported outside the package.

---

# Versioning Strategy

The repository follows Semantic Versioning.

```
MAJOR.MINOR.PATCH
```

Internal packages should evolve together unless independently versioned in the future.

---

# Build Strategy

Goals:

- Incremental builds
- Package-level caching
- Parallel execution
- Deterministic outputs

Typical pipeline:

```text
Type Check

↓

Lint

↓

Unit Tests

↓

Package Build

↓

Application Build

↓

E2E Tests
```

---

# Testing Strategy

Each package owns its tests.

```text
tests/

unit/

integration/

fixtures/
```

Shared test utilities belong in dedicated testing packages.

---

# Ownership

Every package should have:

- Maintainer
- Reviewer
- Documentation owner

Ownership should be documented in the package README.

---

# Package Responsibilities

Each package should have:

- Single responsibility
- Stable public interface
- Minimal dependencies
- Comprehensive tests
- Documentation

If a package has multiple unrelated responsibilities, split it.

---

# Cross-Package Communication

Preferred approaches:

- Interfaces
- Events
- Service contracts

Avoid direct implementation coupling.

---

# Code Generation

Generated code should be isolated.

Suggested location:

```text
generated/
```

Generated files should never be manually edited.

---

# Build Artifacts

Compiled output belongs in:

```text
dist/
```

Temporary artifacts:

```text
.cache/

coverage/

tmp/
```

These directories should not be committed.

---

# Documentation Requirements

Each package should include:

- README.md
- Purpose
- Public APIs
- Examples
- Dependency list
- Testing instructions

---

# Monorepo Governance

Changes affecting multiple packages should:

- Be reviewed by architecture owners
- Update affected documentation
- Include migration guidance when necessary

---

# Architecture Constraints

Mandatory rules:

- No circular dependencies
- No duplicated platform services
- No hidden cross-package imports
- No business logic inside UI packages
- No direct filesystem access outside platform services

---

# Future Evolution

Planned improvements include:

- Independent package publishing
- Plugin SDK extraction
- Remote package execution
- Multi-repository federation
- Automated dependency visualization

---

# Related Documents

- 01-system-overview.md
- 03-platform-layer.md
- 04-di.md
- CONTRIBUTING.md
- CODING_STANDARDS.md

---

# Summary

The monorepo architecture provides a scalable foundation for Open Code Studio by organizing code into well-defined packages with strict dependency rules, consistent structure, and clear ownership. This approach enables parallel development, incremental builds, and long-term maintainability while preventing architectural erosion.
