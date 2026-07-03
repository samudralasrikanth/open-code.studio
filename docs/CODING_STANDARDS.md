# Coding Standards

> Version: 1.0
> Applies To: Entire Monorepo

---

# Purpose

This document defines mandatory coding standards for Open Code Studio.

Goals:

- Consistent codebase
- Readability
- Maintainability
- Testability
- Performance
- Security

These standards apply to all packages, applications, services, extensions, and platform components.

---

# Core Principles

1. Readability over cleverness.
2. Explicit is better than implicit.
3. Small modules are preferred over large modules.
4. Composition over inheritance.
5. Interfaces over implementations.
6. Prefer immutability.
7. Avoid hidden side effects.
8. Fail fast with meaningful errors.

---

# General Rules

## DO

- Use TypeScript strict mode.
- Use ES modules.
- Write self-documenting code.
- Keep functions focused.
- Prefer pure functions.
- Remove dead code.
- Use descriptive names.

## DON'T

- Use `any`.
- Disable lint rules without justification.
- Introduce circular dependencies.
- Duplicate business logic.
- Mix UI and domain logic.

---

# Naming Conventions

## Files

```
workspace-service.ts
editor-panel.tsx
command-registry.ts
```

Never:

```
WorkspaceService.ts
myFile.ts
abc.ts
```

---

## Interfaces

Prefix with `I`.

```
IWorkspaceService
ILogger
IConfigurationProvider
```

---

## Classes

```
WorkspaceService
FileIndexer
ExtensionHost
```

---

## React Components

```
EditorView
Sidebar
CommandPalette
```

---

## Hooks

```
useWorkspace()
useEditor()
useTheme()
```

---

## Constants

```
MAX_FILE_SIZE
DEFAULT_TIMEOUT
```

---

## Enums

```
ThemeMode
WorkspaceState
EditorType
```

---

# Folder Structure

```
feature/

components/
hooks/
services/
models/
utils/
types/
tests/
```

Avoid deeply nested folders.

---

# Function Guidelines

Maximum recommended size:

```
40 lines
```

Maximum parameters:

```
4
```

If more are required:

```
Create an options object.
```

Bad

```ts
createWorkspace(a, b, c, d, e, f);
```

Good

```ts
createWorkspace({
  root,
  settings,
  trusted
});
```

---

# Classes

A class should have a single responsibility.

If a class exceeds approximately **300 lines**, consider splitting it.

---

# Dependency Injection

Never instantiate services directly.

Bad

```ts
const logger = new Logger();
```

Good

```ts
constructor(
    logger: ILogger
)
```

---

# Error Handling

Never swallow exceptions.

Bad

```ts
catch(e){}
```

Good

```ts
catch(error){
    logger.error(error);
    throw error;
}
```

---

# Async Code

Always use:

```
async/await
```

Avoid nested Promise chains.

---

# Logging

Use platform logging.

Never:

```
console.log()
```

Allowed:

- Development debugging
- Unit tests

---

# Comments

Comment **why**, not **what**.

Bad

```ts
// Increment i
i++;
```

Good

```ts
// Retry because network requests are eventually consistent.
```

---

# TypeScript Rules

Required:

- strict
- noImplicitAny
- exactOptionalPropertyTypes
- noUncheckedIndexedAccess

Prefer:

```
unknown

```

instead of

```
any
```

---

# React Guidelines

Prefer:

Functional components

Avoid:

Class components

State:

- Local → useState
- Shared → Context or Store
- Derived → Memoization

---

# Imports

Order:

```
Node

Third-party

Workspace aliases

Relative imports
```

Example

```ts
import fs from "node:fs";

import React from "react";

import { ILogger } from "@/platform";

import "./styles.css";
```

---

# Formatting

Indentation

```
4 spaces
```

Maximum line length

```
100 characters
```

Trailing commas

```
Always
```

Quotes

```
Double quotes
```

Semicolons

```
Required
```

---

# Testing

Every new feature requires tests.

Minimum coverage:

| Layer      | Target |
| ---------- | ------ |
| Platform   | 90%    |
| Services   | 90%    |
| UI         | 80%    |
| Extensions | 80%    |

---

# Performance

Avoid

- unnecessary renders
- unnecessary allocations
- repeated filesystem access
- repeated AI requests

Measure before optimizing.

---

# Security

Never:

- store secrets in code
- trust IPC input
- trust extension input
- expose stack traces to users

---

# Code Review Checklist

- Naming is clear
- Tests added
- Documentation updated
- No duplicated logic
- No security issues
- No performance regressions
- Architecture respected

---

# Related Documents

- API_GUIDELINES.md
- TESTING_GUIDELINES.md
- SECURITY_GUIDELINES.md
- PERFORMANCE_GUIDELINES.md
- ARCHITECTURE.md

---

End of Document
