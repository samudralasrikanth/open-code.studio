# ADR-0008-extension-host — Extension Host

## Status

Accepted

## Date

2026-07-03

## Context

This decision affects multiple architectural layers and establishes a long-term platform direction.

## Decision

Run extensions in an isolated host process with a stable API boundary to improve reliability and security.

## Drivers

- Maintainability
- Extensibility
- Performance
- Security

## Consequences

### Positive

- Consistent architecture
- Easier future enhancements
- Reduced implementation duplication

### Trade-offs

- Additional abstraction
- Higher initial implementation effort

## Alternatives

- Simpler implementation
- Different technology choice
- Deferred adoption

## Related

- ARCHITECTURE.md
- docs/architecture/
- DECISIONS.md
