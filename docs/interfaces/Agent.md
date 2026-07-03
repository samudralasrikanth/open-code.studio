# Interface Specification: Agent

This document defines the strict engineering contract for the Agent subsystem.

---

## 1. Responsibilities

- Register, manage, and coordinate sub-agents (Planner, Coder, Reviewer, Tester).
- Spawn agents inside secure, isolated sandbox subprocesses.
- Translate user requirements into actionable plans and verify code changes.
- Handle agent state recovery, timeouts, and user feedback prompts.

---

## 2. Lifetime & Ownership

- **Owner:** Managed via Dependency Injection (`container.register("IAgentHostService", AgentHostService)`).
- **Lifetime Scope:** Transient/Session-based per executing task.
- **Process Boundaries:** Agent instances run in isolated Node.js utility processes to ensure crash isolation and resource limit enforcement.

---

## 3. Threading & Concurrency Model

- **Subprocess Execution:** Utility processes running agent loops communicate with the Main process asynchronously via JSON-RPC over IPC.
- **Task Queuing:** Agent execution requests are queued and processed sequentially to prevent CPU exhaustion.

---

## 4. Cardinality & Implementations

- **Single Host Coordinator:** One active `AgentHostService` coordinates agent sandboxes.
- **Agent Types:**
  - `PlannerAgent`: Evaluates requirements and decomposes tasks.
  - `CodingAgent`: Executes file edits and validates code syntax.
  - `ReviewerAgent`: Runs code validation and linter checks.

---

## 5. Event Specifications

- **`onAgentStarted`**
  - **Payload:** `{ sessionId: AgentSessionId; agentType: string }`
- **`onAgentStepExecuted`**
  - **Payload:** `{ sessionId: AgentSessionId; stepId: string; status: "success" | "failure" }`
- **`onAgentPromptRequired`**
  - **Payload:** `{ sessionId: AgentSessionId; question: string; options: string[] }`

---

## 6. Error & Failure Contracts

- **Error DTOs:**
  - `AgentExecutionTimeoutError`: Agent execution loop exceeded runtime limits.
  - `SandboxSecurityError`: Agent attempted restricted file writes or command executions.
  - `CodeValidationFailedError`: Coding agent failed AST check or test compilation after max retries.
- **IPC Boundaries:** Main process intercepts raw `Error` objects and serializes them into sanitized `{ success: false, code: string, message: string }` DTOs before sending them to the Renderer process over Electron IPC.

---

## 7. Electron IPC & API Mapping

- **IPC Channels:**
  - `agent:execute` $\rightarrow$ `executeAgentTask(task, token)`
  - `agent:approve` $\rightarrow$ `submitUserApproval(stepId, approved)`
  - `agent:status` $\rightarrow$ `getAgentStatus(sessionId)`

---

## 8. Performance Targets

- **Sandbox Spawn Latency:** $<150\text{ms}$ to launch a sandboxed utility process.
- **AST Edit Validation:** $<200\text{ms}$ to run validation checks on generated code chunks.

---

## 9. Persistence & State

- Plan steps, tool execution traces, and agent conversation logs are written to SQLite databases inside the user's workspace metadata folder.

---

## 10. Required Test Scenarios

- **Unit Tests:** Verify that plans are decomposed into correct DAG structures.
- **Integration Tests:** Verify that spawning an agent and aborting it via a `CancellationToken` terminates the backing utility process immediately.
- **Security Tests:** Trigger a mock agent to write outside the sandbox path and verify that `SandboxSecurityError` blocks the execution.
