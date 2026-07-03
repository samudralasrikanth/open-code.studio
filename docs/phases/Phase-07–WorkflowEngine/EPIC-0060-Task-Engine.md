# EPIC-0060 — Task Engine

| Property           | Value                                        |
| ------------------ | -------------------------------------------- |
| Epic ID            | EPIC-0060                                    |
| Phase              | Phase 7 — Workflow Engine                    |
| Status             | 📋 Planned                                   |
| Priority           | Critical                                     |
| Estimated Duration | 3 Weeks                                      |
| Dependencies       | EPIC-0058 Workflow Core, EPIC-0059 Scheduler |
| Blocks             | EPIC-0061 Approval Gates, EPIC-0062 Rollback |

---

# 1. Overview

The Task Engine executes the smallest unit of work within a workflow.

Each task encapsulates a single responsibility, such as invoking an AI agent, running a command, validating results, or updating workspace state.

Tasks are composable, retryable, resumable, and independently observable.

---

# 2. Vision

Provide a deterministic execution engine capable of running millions of workflow tasks reliably.

Supported Tasks

- AI Task
- Shell Task
- File Task
- Git Task
- Validation Task
- Approval Task
- Plugin Task
- HTTP Task

---

# 3. Goals

- Task execution
- Retry
- Timeout
- Dependencies
- Cancellation
- Progress tracking

---

# 4. Scope

Included

- Task Runtime
- Execution Context
- Retry Logic
- Progress Tracking

Excluded

- Workflow analytics

---

# 5. Architecture

```mermaid
flowchart LR

Workflow

↓

Task Engine

↓

Task

↓

Agent

↓

Result

↓

Workflow
```

---

# 6. Components

- Task Runtime
- Task Registry
- Retry Engine
- Timeout Manager
- Progress Tracker

---

# 7. APIs

```typescript
execute();

retry();

cancel();

progress();

result();
```

---

# 8. IPC

```
task.execute
task.progress
task.cancel
```

---

# 9. Commands

```
task.run
task.retry
task.cancel
task.inspect
```

---

# 10. Events

```
task.created
task.started
task.completed
task.failed
task.cancelled
```

---

# 11. Stories

- Task Runtime
- Retry Engine
- Timeout Manager
- Progress Tracking
- Diagnostics

---

# 12. Tasks

- [ ] Runtime
- [ ] Retry
- [ ] Timeout
- [ ] Progress
- [ ] Diagnostics

---

# 13. Performance

| Metric          | Target |
| --------------- | ------ |
| Task Start      | <10 ms |
| Retry           | <20 ms |
| Progress Update | <5 ms  |

---

# 14. Definition of Done

- Task execution reliable
- Retry operational
- Timeouts enforced
- Coverage ≥90%

---

# 15. Acceptance Criteria

- Tasks execute correctly
- Retries work
- Progress visible
- Cancellation immediate

---

# 16. Risks

- Infinite retries
- Hung tasks
- Resource leaks

---

# 17. Future

- Distributed task execution
- GPU task scheduling
- Workflow templates

---

# 18. Deliverables

- Task Runtime
- Retry Engine
- Progress Tracker
- Diagnostics

---

# 19. Traceability

REQ-WF-003

ADR-109 Task Engine

---

# 20. Changelog

v1.0 Initial Specification
