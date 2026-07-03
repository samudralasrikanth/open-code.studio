# 11. Coding Conventions

This document establishes the strict coding conventions for Open-Code.Studio. All contributions, whether by developers or AI agents, must conform to these conventions to prevent architectural drift.

---

## 1. Architectural Core Principles

### Dependency Injection (DI)

- **Rule:** Always use the global DI container (`container`) to register and resolve services.
- **Convention:**
  - Never instantiate services manually (`new MyService()`).
  - Declare constructor dependencies explicitly:
    ```typescript
    constructor(
      @inject("IWorkspaceService") private workspace: IWorkspaceService
    ) {}
    ```

### Singletons

- **Rule:** Never use the GoF Singleton pattern (`MyService.getInstance()`).
- **Convention:** Singleton behavior must be managed solely by the DI container's registration lifecycle (`container.registerSingleton("IService", Service)`).

### Event-Driven Communication

- **Rule:** Cross-package communication must go through the event bus or commands, never through direct class imports across package boundaries.
- **Convention:** Use `EventBus.publish("event.type", payload)` to broadcast events.

### Static Utilities

- **Rule:** Static utility classes/methods are permitted only for pure functions (deterministic functions with no side effects and no external dependencies).
- **Convention:** Utility functions (like string formatting or math calculations) can be static. Any class performing file I/O, network requests, or holding state must be a registered service.

---

## 2. Code Design Patterns

### Repository Pattern

- **Rule:** Repositories must be interface-first.
- **Convention:** Define `IUserRepository` before writing `SqliteUserRepository`.

### Stateless Services

- **Rule:** Domain services must be stateless.
- **Convention:** Hold state inside Domain Entities (e.g. `Workspace`, `Document`) or caches managed by specific lifecycle scopes, never inside service instances.

### Immutable DTOs (Data Transfer Objects)

- **Rule:** DTOs passed across IPC channels or event payloads must be immutable.
- **Convention:** Use `readonly` TypeScript properties and `ReadonlyArray<T>`:
  ```typescript
  export interface FileOpenedPayload {
    readonly uri: string;
    readonly fileType: string;
  }
  ```

### Commands & Results

- **Rule:** All command handlers must return a unified `Result<T>` structure rather than throwing exceptions or returning raw values.
- **Convention:**
  ```typescript
  type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E };
  ```

---

## 3. Error Handling & IPC Boundaries

### No IPC Exceptions

- **Rule:** Never throw raw errors across IPC boundaries (Main to Renderer). Doing so causes unhandled promise rejections and string serialization issues.
- **Convention:** Main process IPC handlers must catch all exceptions and return a sanitized, serialized error DTO:
  ```typescript
  // Main Process Handler
  ipcMain.handle("workspace:read", async (event, path) => {
    try {
      const content = await workspaceService.readFile(path);
      return { success: true, value: content };
    } catch (error) {
      return { success: false, error: { code: "READ_FAILED", message: error.message } };
    }
  });
  ```
- **Renderer Consumption:** The Renderer checks `success` and presents a UI notification or rejects the local promise based on the error code.
