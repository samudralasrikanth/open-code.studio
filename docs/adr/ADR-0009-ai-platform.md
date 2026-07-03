# ADR-0009-ai-platform — AI Platform

## Status

Accepted

## Date

2026-07-03

## Context

This decision affects multiple architectural layers and establishes a long-term platform direction.

## Decision

Adopt a provider-agnostic AI platform with model routing, context assembly, and tool calling instead of tightly coupling to a single LLM vendor.

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
