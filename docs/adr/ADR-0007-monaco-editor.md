# ADR-0007-monaco-editor — Monaco Editor

## Status

Accepted

## Date

2026-07-03

## Context

This decision affects multiple architectural layers and establishes a long-term platform direction.

## Decision

Use Monaco as the primary code editing engine to provide modern IDE features and maximize compatibility with the VS Code ecosystem.

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
