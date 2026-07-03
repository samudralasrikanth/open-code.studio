# Service Template

> Copy this document when implementing a new service.

---

# Service Name

```
WorkspaceService
```

---

# Interface

```ts
export interface IWorkspaceService {
  open();

  close();

  reload();
}
```

Every service must expose an interface.

---

# Responsibilities

Examples

- Manage workspace lifecycle
- Coordinate file watchers
- Publish workspace events

---

# Dependencies

Inject dependencies.

Example

```ts
constructor(

    logger: ILogger,

    configuration: IConfigurationService,

    fileSystem: IFileSystem

){}
```

Never instantiate dependencies directly.

---

# Events

Published

```
WorkspaceOpened

WorkspaceClosed

WorkspaceReloaded
```

Consumed

```
ConfigurationChanged
```

---

# Error Handling

Return typed errors.

Never swallow exceptions.

Log unexpected failures.

---

# Threading

Long-running operations must be asynchronous.

Never block the UI thread.

---

# Testing

Required

- Unit Tests
- Mock external dependencies
- Error cases
- Edge cases

Coverage Target

```
90%
```

---

# Performance

Measure

- Execution time
- Memory allocations
- Event frequency

---

# Security

Validate:

- Inputs
- Permissions
- File paths
- External requests

---

# Documentation

Include

- Public API
- Events
- Dependencies
- Examples

---

# Review Checklist

- Interface defined
- DI used
- Async where appropriate
- Events documented
- Tests written
- No duplicated logic

---

End of Template
