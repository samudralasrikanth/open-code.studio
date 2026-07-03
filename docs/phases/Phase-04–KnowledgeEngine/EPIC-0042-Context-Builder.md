# EPIC-0042 — Context Builder

# EPIC-0042 — Context Builder

| Property     | Value                                                                             |
| ------------ | --------------------------------------------------------------------------------- |
| Epic ID      | EPIC-0042                                                                         |
| Phase        | Phase 4 — Knowledge Engine                                                        |
| Status       | 📋 Planned                                                                        |
| Priority     | Critical                                                                          |
| Dependencies | EPIC-0039 Dependency Graph, EPIC-0040 Embedding Engine, EPIC-0041 Semantic Search |

---

# 1. Overview

The Context Builder assembles optimal AI context by combining semantic search, dependency analysis, symbol relationships, workspace knowledge, and token budgeting.

It determines exactly what information should be sent to an LLM.

---

# 2. Vision

Provide intelligent context assembly instead of naive file concatenation.

Sources

- Semantic Search
- Dependency Graph
- Symbols
- Documentation
- Git History
- Memory
- User Selection

---

# 3. Goals

- Context assembly
- Token budgeting
- Deduplication
- Ranking
- Compression
- Prompt packaging

---

# 4. Scope

Included

- Context Builder
- Context Ranking
- Token Budget
- Compression

Excluded

- Prompt templates
- AI execution

---

# 5. Architecture

```mermaid
flowchart LR

User Request

↓

Semantic Search

↓

Dependency Graph

↓

Memory

↓

Context Ranking

↓

Token Budget

↓

Prompt Package
```

---

# 6. Components

- Context Builder
- Context Ranker
- Budget Manager
- Compressor
- Prompt Packager

---

# 7. APIs

```typescript
build();

preview();

estimateTokens();

compress();

statistics();
```

---

# 8. IPC

```
context:build

context:preview
```

---

# 9. Commands

```
context.build
context.preview
context.statistics
```

---

# 10. Events

```
context.created
context.compressed
context.completed
```

---

# 11. Stories

- Context Selection
- Ranking
- Budget Manager
- Compression
- Prompt Packaging

---

# 12. Tasks

- [ ] Builder
- [ ] Ranking
- [ ] Compression
- [ ] Budget
- [ ] Metrics

---

# 13. Performance

| Metric         | Target  |
| -------------- | ------- |
| Context Build  | <100 ms |
| Compression    | <50 ms  |
| Token Estimate | <10 ms  |

---

# 14. Definition of Done

- Token-aware
- Context ranked
- Compression implemented
- Coverage ≥90%

---

# 15. Acceptance Criteria

- Relevant context assembled
- Token limits respected
- Duplicate context removed
- Prompt packages reproducible

---

# 16. Risks

- Irrelevant context
- Token overflow
- Poor ranking

---

# 17. Future

- AI context optimization
- Adaptive token budgets
- Multi-agent context sharing

---

# 18. Deliverables

- Context Builder
- Ranking Engine
- Budget Manager
- Prompt Packager

---

# 19. Traceability

REQ-KE-014

REQ-KE-015

ADR-091

---

# 20. Changelog

v1.0 Initial Specification
