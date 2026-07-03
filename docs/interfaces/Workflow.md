# Interface Specification: Workflow

This document defines the strict engineering contract for the Workflow subsystem.

---

## 1. Responsibilities

- Execute pipelines consisting of sequential or parallel steps.
- Maintain execution transaction states and handle rolls backs on failure.
- Track step runtime execution histories and output logs.
- Manage approval gates requiring manual human intervention.

---

## 2. Lifetime & Ownership

- **Owner:** Managed via Dependency Injection (`container.register("IWorkflowService", WorkflowService)`).
- **Lifetime Scope:** Singleton per active window session.
- **Workflow State:** Tracked inside memory during execution and stored in SQLite tables for historical query logs.

---

## 3. Threading & Concurrency Model

- **Asynchronous Loop:** Workflow steps execute asynchronously, using event loops to check for process or agent completion signals.
- **Parallel Step Execution:** Parallel steps are processed using Promise pools to restrict resource consumption.

---

## 4. Cardinality & Implementations

- **Single Coordinator:** One active `WorkflowService` instance tracks running workflows.
- **Workflow Implementations:**
  - `LocalWorkflowRunner` (executes steps on the local workstation PTY/agents).
  - `RemoteWorkflowRunner` (coordinates steps across cloud servers/remote nodes).

---

## 5. Event Specifications

- **`onWorkflowStarted`**
  - **Payload:** `{ workflowId: string; definitionId: string }`
- **`onStepTransition`**
  - **Payload:** `{ workflowId: string; stepId: string; status: "executing" | "success" | "failed" }`
- **`onWorkflowCompleted`**
  - **Payload:** `{ workflowId: string; duration: number; status: "success" | "failed" }`

---

## 6. Error & Failure Contracts

- **Error DTOs:**
  - `WorkflowStepFailedError`: Execution of a specific step failed.
  - `RollbackFailedError`: Failed to restore system state after step failure.
- **IPC Boundaries:** Main process intercepts raw `Error` objects and serializes them into sanitized `{ success: false, code: string, message: string }` DTOs before sending them to the Renderer process over Electron IPC.

---

## 7. Electron IPC & API Mapping

- **IPC Channels:**
  - `workflow:start` $\rightarrow$ `runWorkflow(definitionId)`
  - `workflow:cancel` $\rightarrow$ `cancelWorkflow(workflowId)`
  - `workflow:history` $\rightarrow$ `getWorkflowHistory()`

---

## 8. Performance Targets

- **Step Overhead:** $<2\text{ms}$ execution dispatch latency between steps.
- **State Save Time:** $<5\text{ms}$ database commit time.

---

## 9. Persistence & State

- Complete execution definitions, run paths, variables, and output logs are persisted in SQLite tables to allow historical analysis.

---

## 10. Required Test Scenarios

- **Unit Tests:** Verify that steps are executed in correct order matching defined DAG dependencies.
- **Integration Tests:** Verify that throwing an error during a step correctly triggers the rollback strategy.
- **Cancellation Tests:** Cancel a running workflow and verify that active background subprocesses terminate cleanly.
