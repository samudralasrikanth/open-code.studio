# package: @ocs/workflow

This package contains the workflow engine, running DAG execution pipelines, handling rollbacks, and tracking execution steps.

---

## 1. Architecture

The Workflow engine runs step execution tasks sequentially or concurrently using step coordinators, logging execution state to the DB.

```
@ocs/workflow/
├── src/
│   ├── domain/                  # Workflow definition models
│   │     ├── Workflow.ts
│   │     └── WorkflowStep.ts
│   ├── application/             # Step executors and runners
│   │     ├── WorkflowRunner.ts
│   │     └── RollbackManager.ts
│   └── infrastructure/          # State persistence
│         └── HistoryStore.ts
```

---

## 2. Public API

- `WorkflowRunner`
  - `run(workflow: WorkflowDefinition): Promise<WorkflowRun>`
  - `cancel(runId: string): Promise<void>`
- `RollbackManager`
  - `rollback(runId: string): Promise<void>`

---

## 3. Internal API

- `StepExecutionCoordinator`: Manages the concurrent Promise pool execution.
- `HistoryStore`: Commits step output and duration metrics to the memory database.

---

## 4. Dependencies

- `@ocs/common` (Leaf utilities)
- `@ocs/event-bus` (Event coordination)

---

## 5. Import Rules

- **Allowed Imports:** `@ocs/common`, `@ocs/event-bus`.
- **Forbidden Imports:** AI agent domains or workspace components.

---

## 6. Lifecycle

- Created and executed dynamically on user prompt or automated triggers. Disposed on execution completion.

---

## 7. Testing

- Run tests via `pnpm test`.
- Uses mock step runners that output deterministic success/fail states to verify DAG execution paths and rollback calls.

---

## 8. Example Usage

```typescript
import { WorkflowRunner } from "@ocs/workflow";
import { container } from "@ocs/common";

const runner = container.resolve<WorkflowRunner>("WorkflowRunner");
const run = await runner.run(myWorkflowDefinition);
```
