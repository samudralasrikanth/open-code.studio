# Implementation Policy & Agent Operating Procedure

This document governs the execution of all coding tasks, establishing strict rules for PR merges, definition of ready, and the permanent execution pipeline for development agents.

---

## 1. Core Coding Rules

Every Pull Request (PR) must strictly adhere to the following rules:

1. **One Story per PR:** PRs must map to exactly one story. Multi-story or cross-epic changes will be rejected.
2. **Size Constraint:** Code changes must not exceed 500 Lines of Code (LOC) unless explicitly authorized by the architect.
3. **Clean Code Integrity:** No `TODO` comments, commented-out code blocks, or placeholder implementations are allowed in production code.
4. **Validation Requirements:**
   - Unit and integration tests must pass.
   - Package code coverage must remain $\ge 90\%$.
   - Linting and TypeScript typechecking checks must pass with zero warnings.
5. **No Architectural Regressions:** Any change violating dependency rules (e.g. cross-package circular imports) blocks merge automatically.
6. **Integration Loop:**
   - **Story Loop:** Implement $\rightarrow$ Tests $\rightarrow$ Review $\rightarrow$ Docs update $\rightarrow$ Stop.
   - **Epic Loop:** Complete all story loops $\rightarrow$ Demo sandbox execution $\rightarrow$ Merge.

---

## 2. Definition of Ready (DoR)

A story is defined as **Ready** to start implementation _only_ when the following conditions are met:

- **Acceptance Criteria:** Verifiable, explicit acceptance criteria are defined.
- **Dependencies:** All prerequisite stories and epics are completed and verified.
- **Interfaces:** Abstract interface definitions for the story are documented in `docs/interfaces/`.
- **Target Files:** Target file paths and package boundaries are identified.
- **Test Plan:** The unit and integration tests to be written are cataloged.
- **ADR Review:** Any potential conflicts with existing ADRs are resolved.
- **Performance Budget:** Targeted latency and memory thresholds are identified.

---

## 3. Permanent Agent Operating Procedure

All coding agents must follow this sequential execution pipeline:

```
[1. Read Architecture]  --> [2. Read ADRs]  --> [3. Read Interfaces]  --> [4. Read Package README]
                                                                                   │
[8. Implement Code]    <-- [7. Read Task]  <-- [6. Read Story]   <-- [5. Read Epic]
         │
         ▼
[9. Run Unit Tests]     --> [10. Run Integration] --> [11. Run Lint & Typecheck]
                                                                   │
[14. Stop & Wait]      <-- [13. Update Docs] <-- [12. Self Review] ◄─┘
```

---

## 4. Version Tracing Rule

To maintain traceability across a large codebase as specifications evolve:

- Every completed story must document which **Architecture Version** it was built against (e.g., _Built against Architecture v1.0.0_).
- This record must be appended to the story's walkthrough log.
- If a future ADR updates the architecture to `v1.1.0`, the version registry identifies which completed stories need compatibility reviews.
