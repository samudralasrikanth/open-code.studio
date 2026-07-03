# Package Template

> Copy this document when creating a new package.

---

# Package Name

```
@open-code/<package-name>
```

Example

```
@open-code/workspace
```

---

# Purpose

Describe the package in one paragraph.

Example:

> Provides workspace lifecycle management, project loading, and workspace configuration.

---

# Responsibilities

- Responsibility 1
- Responsibility 2
- Responsibility 3

---

# Non-Responsibilities

This package MUST NOT:

- Access UI directly
- Access Electron APIs directly
- Duplicate platform services

---

# Public API

```ts
export interface IWorkspaceService {
  open();

  close();

  reload();
}
```

Only documented APIs should be exported.

---

# Dependencies

Allowed Dependencies

- Platform
- Shared Types
- Utilities

Forbidden Dependencies

- UI packages
- Renderer
- Electron Main
- Circular package references

---

# Folder Structure

```
src/

    index.ts

    services/

    models/

    types/

    utils/

tests/

README.md

package.json
```

---

# Testing

Required

- Unit Tests
- Integration Tests (if applicable)

Coverage Target

```
90%
```

---

# Documentation

Every package should include:

- README.md
- Public API examples
- Architecture notes (if needed)

---

# Performance

Review:

- Startup cost
- Memory usage
- Allocations
- Async operations

---

# Security

Review:

- Input validation
- Error handling
- Secret handling
- Dependency risks

---

# Review Checklist

- Single responsibility
- Clear API
- Tests added
- Documentation updated
- No circular dependencies
- No duplicate functionality

---

End of Template
