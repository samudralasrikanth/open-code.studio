# ADR-0005-dependency-injection — Dependency Injection

## Status

Accepted

## Date

2026-07-03

## Context

As Open Code Studio grows, this architectural area affects multiple subsystems and requires a consistent long-term approach.

## Decision

Use constructor-based dependency injection with interface-first design to decouple services, simplify testing, and support replaceable implementations.

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
