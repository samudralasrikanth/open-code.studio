# API Guidelines

> Version: 1.0
> Applies To: All Internal and Public APIs

---

# Purpose

This document defines standards for designing consistent, maintainable, and backward-compatible APIs across Open Code Studio.

Applies to:

- Platform APIs
- Extension APIs
- IPC APIs
- Internal Services
- REST APIs (future)
- MCP Tools

---

# Design Principles

APIs should be:

- Simple
- Predictable
- Discoverable
- Versionable
- Testable
- Secure

---

# General Rules

## DO

- Design interfaces first.
- Use dependency injection.
- Keep APIs focused.
- Return typed objects.
- Validate inputs.

## DON'T

- Leak implementation details.
- Throw undocumented errors.
- Break compatibility unnecessarily.
- Expose internal models.

---

# Naming

Methods

```ts
openWorkspace();
saveDocument();
createSession();
```

Avoid

```ts
doStuff();
run();
executeTaskNow();
```

---

# Parameters

Prefer:

```ts
createWorkspace({
  path,
  trusted,
  name
});
```

Avoid:

```ts
createWorkspace(path, trusted, name);
```

---

# Return Types

Good

```ts
Promise<Workspace>;
```

Bad

```ts
Promise<any>;
```

Always use explicit types.

---

# Error Handling

Errors should include:

- code
- message
- optional details

Example

```ts
{
    code: "WORKSPACE_NOT_FOUND",
    message: "...",
    details: {}
}
```

---

# Versioning

Follow Semantic Versioning.

Breaking changes require:

- Major version bump
- Migration notes
- Changelog entry

---

# Backward Compatibility

Public APIs must remain compatible whenever possible.

Allowed additions:

- Optional properties
- New methods
- New overloads

Breaking changes require approval.

---

# IPC APIs

IPC channels must:

- Validate inputs
- Validate outputs
- Never expose Node objects
- Never trust renderer input
- Use typed payloads

Example

```ts
ipc.invoke("workspace.open", payload);
```

---

# Extension APIs

Public extension APIs must:

- Be documented
- Be typed
- Remain stable
- Avoid exposing internals

Experimental APIs should be explicitly marked.

---

# REST APIs (Future)

Use plural resource names.

Examples

```
GET /workspaces
GET /extensions
POST /sessions
```

HTTP methods

| Method | Purpose        |
| ------ | -------------- |
| GET    | Read           |
| POST   | Create         |
| PUT    | Replace        |
| PATCH  | Partial Update |
| DELETE | Remove         |

---

# AI APIs

AI services should expose provider-independent interfaces.

Example

```ts
interface IAIProvider {
  chat();
  embeddings();
  models();
}
```

Provider-specific behavior should remain internal.

---

# Deprecation Policy

Deprecated APIs should:

- Be documented
- Emit warnings where appropriate
- Include migration guidance
- Remain available for at least one minor release unless a security issue requires earlier removal

---

# Documentation Requirements

Every public API should document:

- Purpose
- Parameters
- Return values
- Errors
- Examples
- Version introduced
- Deprecation status (if applicable)

---

# Testing

Every API requires:

- Unit tests
- Error tests
- Edge-case tests
- Compatibility tests for public APIs

---

# Related Documents

- CODING_STANDARDS.md
- ARCHITECTURE.md
- SECURITY_GUIDELINES.md
- TESTING_GUIDELINES.md

---

End of Document
