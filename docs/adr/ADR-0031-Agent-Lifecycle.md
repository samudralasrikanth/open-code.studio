# ADR-0031 — Agent Lifecycle and Execution Loop

## Status

Accepted

## Date

2026-07-03

## Context

AI-native coding requires coordinating planning, editing, compiler verification, and testing. Allowing agents to run unchecked or hardcoding their execution path results in fragile workflows and unsafe local system operations.

## Decision

Define a structured lifecycle and execution loop managed by the Agent Host:

1. **Planner Agent:** Deconstructs user requests into a list of structured task nodes.
2. **Tasks Registry:** Tracks execution state, dependencies, and parameters for each node.
3. **Coding Agent:** Processes coding tasks by executing local file reads, applying edits, and generating diff proposals.
4. **Review Agent:** Analyzes diff proposals for syntactical correctness, style, and security concerns.
5. **Testing Agent:** Compiles the code and executes unit tests (using the Workspace Runner tools). If tests fail, it returns the error stack back to the Planner/Coding agent for a retry cycle.
6. **Documentation Agent:** Generates or updates relevant markdown or inline documentation.

```
[ User Request ] ──> [ Planner Agent ] ──> [ Task Registry ]
                                                  │
 ┌────────────────────────────────────────────────┘
 ▼
[ Coding Agent ] ──> [ Review Agent ] ──> [ Testing Agent ]
       ▲                                         │
       │                                         ▼
       └───────────(If Tests Fail)───────────────┤ (If Tests Pass)
                                                 ▼
                                           [ Documentation ]
```

## Consequences

- **Positive:** Code changes are verified before they are committed, preventing agents from breaking the build.
- **Negative:** Iterative loop cycles can increase overall execution time and token costs.
