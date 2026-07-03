# IPC API Specifications

This document defines the Electron IPC communication contract between the Renderer process (UI) and the Main process (OS/Platform).

---

## 1. IPC Protocol Design

All IPC requests use asynchronous invoke/handle patterns. The Renderer invokes a channel and awaits a unified `Result<T>` payload:

```typescript
interface IResultSuccess<T> {
  success: true;
  value: T;
}

interface IResultFailure {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type IResult<T> = IResultSuccess<T> | IResultFailure;
```

---

## 2. Channel Definitions

### Workspace Channels

- **`workspace:mount`**
  - **Invoked with:** `{ path: string }`
  - **Returns:** `IResult<WorkspaceMetadata>`
- **`workspace:read`**
  - **Invoked with:** `{ uri: string }`
  - **Returns:** `IResult<string>`
- **`workspace:write`**
  - **Invoked with:** `{ uri: string; content: string }`
  - **Returns:** `IResult<void>`

### Document Channels

- **`document:open`**
  - **Invoked with:** `{ uri: string }`
  - **Returns:** `IResult<DocumentContent>`
- **`document:save`**
  - **Invoked with:** `{ uri: string }`
  - **Returns:** `IResult<void>`

### Terminal Channels

- **`terminal:spawn`**
  - **Invoked with:** `{ shell: string; cwd: string; cols: number; rows: number }`
  - **Returns:** `IResult<{ sessionId: string; pid: number }>`
- **`terminal:resize`**
  - **Invoked with:** `{ sessionId: string; cols: number; rows: number }`
  - **Returns:** `IResult<void>`

### Agent Channels

- **`agent:execute`**
  - **Invoked with:** `{ task: string }`
  - **Returns:** `IResult<{ sessionId: string }>`
- **`agent:cancel`**
  - **Invoked with:** `{ sessionId: string }`
  - **Returns:** `IResult<void>`
