# ADR-0006-event-bus — Event Bus

## Status

Accepted

## Date

2026-07-03

## Context

As Open Code Studio grows, this architectural area affects multiple subsystems and requires a consistent long-term approach.

## Decision

Adopt an event-driven architecture for cross-cutting communication to reduce coupling between subsystems and improve extensibility.

## Rationale

- Improves maintainability
- Supports modular architecture
- Reduces implementation coupling
- Enables long-term evolution

## Consequences

### Positive

- Consistent implementation across packages
- Easier testing and refactoring
- Better scalability

### Negative

- Additional upfront complexity
- Contributor learning curve

## Alternatives Considered

1. Simpler implementation with fewer abstractions
2. Incremental adoption
3. Technology-specific implementations

## Related Documents

- ARCHITECTURE.md
- DECISIONS.md
- docs/architecture/
