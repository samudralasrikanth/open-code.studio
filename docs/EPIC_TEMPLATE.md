# Open-Code.Studio — Epic Template

> **Purpose**
>
> This template defines the standard structure for every Epic in Open-Code.Studio.
>
> Every Epic must follow this format before implementation begins.
>
> This document is mandatory for all platform, infrastructure, AI, and enterprise epics.

---

# EPIC-XXXX — <Epic Name>

**Phase:** Phase X — <Phase Name>

**Priority:** P0 | P1 | P2

**Estimated Sprint:** Sprint XX

**Status:**

- Draft
- Under Review
- Approved
- In Progress
- Completed
- Deferred

**Owner:** <Team>

**Version:** 1.0

---

# Executive Summary

Provide a short overview (2–4 paragraphs) explaining:

- Why this Epic exists
- What problem it solves
- What capabilities it introduces
- Why it is needed now

---

# Goal

Describe the primary objective.

Example:

> Build the Document Platform responsible for document lifecycle management, dirty state tracking, persistence, and editor integration.

---

# Business Value

Describe the value delivered.

Examples:

- Improves developer productivity
- Reduces architecture coupling
- Enables future AI features
- Improves performance
- Enables extension compatibility

---

# Scope

## In Scope

List everything included.

Example:

- Document lifecycle
- Dirty tracking
- Save pipeline
- Events
- Commands

---

## Out of Scope

Explicitly list what will NOT be implemented.

Example:

- AI
- Git
- Search
- Terminal
- Debugging

---

# Dependencies

List prerequisite epics.

Example:

| Epic      | Required |
| --------- | -------- |
| EPIC-0002 | ✅       |
| EPIC-0005 | ✅       |
| EPIC-0006 | ❌       |

---

# Architecture

## High-Level Design

Describe how this subsystem fits into the platform.

Example:

```
Explorer

↓

Commands

↓

Document Platform

↓

Editor Platform

↓

Renderer
```

---

## Packages

List affected packages.

Example:

```
packages/document

packages/editor

packages/common

apps/studio
```

---

## Public APIs

Document all new public APIs.

Example:

```typescript
openDocument();

saveDocument();

closeDocument();

revertDocument();
```

---

## Events

List all events.

Example

| Event           | Publisher       | Subscribers |
| --------------- | --------------- | ----------- |
| document.opened | DocumentService | Editor      |
| document.saved  | DocumentService | Explorer    |

---

## Commands

List command IDs.

Example

```
document.save

document.revert

editor.open
```

---

## IPC

Describe IPC additions.

Renderer

↓

Preload

↓

Main

↓

Service

---

# Stories

---

# STORY-XXXX-001 — <Title>

## Goal

Short description.

---

## Description

Detailed explanation.

---

## Files

List new files.

```
packages/document/

src/

DocumentService.ts
```

---

## Modified Files

```
apps/studio/

main.ts
```

---

## Tasks

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3
- [ ] Task 4

---

## Acceptance Criteria

- [ ] Works correctly
- [ ] Unit tests pass
- [ ] Documentation updated

---

## Risks

Describe implementation risks.

---

## Notes

Additional notes.

---

Repeat for all stories.

---

# Technical Requirements

## Performance

Example

Workspace load

<500ms

Editor switch

<50ms

Explorer

<100ms

---

## Security

Examples

- Validate inputs
- No secrets in logs
- IPC validation

---

## Coding Standards

Must follow:

- Strict TypeScript
- Dependency Injection
- Event-driven architecture
- No circular dependencies
- No UI business logic

---

# Testing Strategy

## Unit Tests

Required

≥90% coverage

Include

- Success cases
- Failure cases
- Edge cases

---

## Integration Tests

List integration scenarios.

Example

- Workspace → Explorer
- Explorer → Document
- Document → Editor

---

## Manual Verification

Create a checklist.

Example

### Startup

- [ ] App launches

### Feature

- [ ] Works correctly

### Error Cases

- [ ] Invalid input handled

### Performance

- [ ] Meets targets

---

# Deliverables

List everything created.

Example

```
packages/document

packages/editor

packages/editor-monaco

tests

docs
```

---

# Definition of Done

Epic is complete when:

- [ ] All stories complete
- [ ] pnpm validate passes
- [ ] Architecture validation passes
- [ ] Test coverage ≥90%
- [ ] Manual verification complete
- [ ] Documentation updated
- [ ] ADRs updated (if required)
- [ ] No known P0/P1 bugs
- [ ] Code reviewed

---

# Risks

List known risks.

Example

| Risk        | Impact | Mitigation   |
| ----------- | ------ | ------------ |
| Large files | High   | Lazy loading |

---

# ADRs

Reference Architecture Decision Records.

Example

- ADR-016
- ADR-017

---

# Future Enhancements

List intentionally deferred work.

Example

- Multi-root workspaces
- Remote editing
- Collaboration

---

# Success Metrics

Examples

Performance

- Startup <2s
- Editor switch <50ms

Quality

- Test coverage ≥90%
- Zero architecture violations

Product

- User workflow completed
- Stable release

---

# Review Checklist

Before approval verify:

## Architecture

- [ ] Layering respected
- [ ] No circular dependencies
- [ ] DI used
- [ ] Events used
- [ ] Commands used

---

## Code Quality

- [ ] Formatting
- [ ] Linting
- [ ] Types
- [ ] Tests

---

## Documentation

- [ ] Walkthrough updated
- [ ] README updated
- [ ] ADR updated
- [ ] Epic updated

---

## Product

- [ ] UX reviewed
- [ ] Performance verified
- [ ] Error handling verified

---

# Post Implementation Summary

To be completed after implementation.

## What Was Built

...

## Architecture Changes

...

## Validation Results

...

## Lessons Learned

...

## Next Epic

EPIC-XXXX
