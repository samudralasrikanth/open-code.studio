# Event Bus API Specifications

This document catalogs the application events published across the Open-Code.Studio system `EventBus`.

---

## 1. Event Registry

### Workspace Events

- **`workspace.file.created`**
  - **Description:** Published when a file is created.
  - **Payload:** `{ uri: string }`
- **`workspace.file.modified`**
  - **Description:** Published when a file is modified outside the editor.
  - **Payload:** `{ uri: string }`
- **`workspace.file.deleted`**
  - **Description:** Published when a file is deleted.
  - **Payload:** `{ uri: string }`

### Document Events

- **`document.opened`**
  - **Description:** Published when a document is successfully loaded.
  - **Payload:** `{ uri: string; docType: "text" | "binary" }`
- **`document.changed`**
  - **Description:** Published when a document buffer state is edited.
  - **Payload:** `{ uri: string; isDirty: boolean }`
- **`document.saved`**
  - **Description:** Published when edits are successfully written to disk.
  - **Payload:** `{ uri: string }`

### Agent Platform Events

- **`agent.task.started`**
  - **Description:** Published when a plan begins execution.
  - **Payload:** `{ sessionId: string; goal: string }`
- **`agent.step.completed`**
  - **Description:** Published when a sub-agent completes a task step.
  - **Payload:** `{ sessionId: string; stepId: string; result: "success" | "failed" }`
- **`agent.execution.finished`**
  - **Description:** Published when the execution finishes.
  - **Payload:** `{ sessionId: string; outcome: "completed" | "aborted" | "failed" }`
