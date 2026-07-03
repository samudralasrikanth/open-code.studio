# EPIC-0022 — Context Manager

| Property           | Value                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Epic ID            | EPIC-0022                                                                                              |
| Phase              | Phase 2 – Runtime                                                                                      |
| Status             | 📋 Planned                                                                                             |
| Priority           | Critical                                                                                               |
| Estimated Duration | 3 Weeks                                                                                                |
| Dependencies       | EPIC-0016 Runtime Service, EPIC-0017 Model Registry, EPIC-0020 GPU Detection, EPIC-0021 Memory Manager |
| Blocks             | EPIC-0023 Token Engine, Phase 3 Gateway, Phase 4 Knowledge Engine, Phase 6 Agent Platform              |

---

# Overview

The Context Manager is responsible for constructing, optimizing, validating, compressing, and managing every prompt context sent to an AI model.

Rather than allowing individual features (Chat, Agents, Workflows, RAG, Extensions, Semantic Search) to build prompts independently, every request flows through the Context Manager.

This makes the Context Manager the single authority for prompt construction and context window utilization.

---

# Vision

Create an intelligent context platform capable of combining information from multiple sources while maximizing context window utilization and minimizing token waste.

Supported context sources include:

- User Prompt
- System Prompt
- Conversation History
- Workspace Files
- Knowledge Engine
- Memory Platform
- Agent State
- Workflow State
- Extension Context

---

# Objectives

## Functional

- Context assembly
- Context validation
- Context optimization
- Context compression
- Context truncation
- Priority ordering
- Context merging
- Context caching
- Token estimation
- Context debugging

## Non-Functional

- Provider independent
- Deterministic
- Extensible
- Event driven
- Low latency
- Observable

---

# Scope

Included

- Context Manager
- Context Builder
- Context Optimizer
- Context Cache
- Compression Engine
- Validation Pipeline

Excluded

- Token counting (EPIC-0023)
- Embeddings
- RAG
- Knowledge Indexing
- Prompt Engineering

---

# Architecture

```
Chat

Agent

Workflow

Extension

↓

Context Manager

↓

Context Builder

↓

Context Optimizer

↓

Compression

↓

Validation

↓

Runtime Service

↓

AI Provider
```

---

# Package Structure

```
packages/context/

domain/
    Context
    ContextBlock
    ContextSource
    ContextPriority

application/
    ContextManager
    ContextBuilder
    ContextOptimizer
    ContextValidator
    ContextCache

compression/
    CompressionEngine

events/
    ContextEvents

commands/
    ContextCommands
```

---

# Core Components

## Context Manager

Responsibilities

- Build context
- Merge sources
- Validate context
- Optimize context
- Publish events

Acts as the only entry point for context generation.

---

## Context Builder

Builds contexts from

- Prompt
- History
- Files
- Memory
- Workspace
- Agent State
- Workflow State

---

## Context Optimizer

Optimizes

- Duplicate removal
- Priority ordering
- Context trimming
- Context compression
- Context reuse

---

## Context Validator

Validates

- Maximum size
- Invalid blocks
- Empty context
- Duplicate entries
- Required sections

---

## Context Cache

Caches

- Recent contexts
- Frequently used prompts
- Shared workspace context
- Agent contexts

Supports LRU eviction.

---

# Context Model

```typescript
id;

requestId;

systemPrompt;

userPrompt;

blocks;

metadata;

priority;

estimatedTokens;

createdAt;
```

---

# Context Block

```typescript
id;

source;

content;

priority;

estimatedTokens;

metadata;
```

---

# Context Sources

```
System

User

Workspace

Knowledge

Memory

Conversation

Agent

Workflow

Extension

Custom
```

---

# Context Priority

```
Critical

High

Normal

Low
```

Higher priority blocks survive truncation first.

---

# Context Lifecycle

```
Input

↓

Build

↓

Merge

↓

Optimize

↓

Compress

↓

Validate

↓

Runtime
```

---

# Compression Strategies

Supports

- Duplicate removal
- Conversation summarization
- File summarization
- Context chunk merging
- Priority pruning

Future

- AI-assisted compression

---

# Renderer Components

```
ContextInspector

ContextPreview

ContextTimeline

ContextStatistics

CompressionReport
```

---

# Commands

```
context.build

context.preview

context.validate

context.optimize

context.clearCache

context.statistics
```

---

# Events

```
context.created

context.optimized

context.validated

context.compressed

context.cached

context.invalid
```

---

# APIs

## ContextManager

```typescript
build();

optimize();

validate();

compress();

preview();

cache();

statistics();
```

---

# IPC Contracts

Renderer

```typescript
window.ocs.context;

preview();

statistics();

validate();

optimize();
```

Main

```
context:preview

context:validate

context:statistics

context:optimize
```

---

# Stories

## STORY-0022-001

Context Domain

Tasks

- Context
- ContextBlock
- Priority
- Sources

---

## STORY-0022-002

Context Builder

Tasks

- Merge prompts
- Merge files
- Merge history
- Merge memory

---

## STORY-0022-003

Optimizer

Tasks

- Remove duplicates
- Priority sorting
- Pruning
- Compression

---

## STORY-0022-004

Validator

Tasks

- Validation rules
- Size checks
- Required sections

---

## STORY-0022-005

Cache

Tasks

- Context cache
- Cache eviction
- Shared contexts

---

## STORY-0022-006

Context UI

Tasks

- Inspector
- Statistics
- Preview
- Compression report

---

# Complete Task Checklist

## Domain

- [ ] Context
- [ ] Block
- [ ] Priority
- [ ] Sources

## Application

- [ ] ContextManager
- [ ] Builder
- [ ] Optimizer
- [ ] Validator
- [ ] Cache

## Infrastructure

- [ ] Compression engine
- [ ] Cache storage

## Renderer

- [ ] Inspector
- [ ] Preview
- [ ] Statistics

## Validation

- [ ] Unit tests
- [ ] Integration tests
- [ ] Large context tests

---

# Manual Verification

✓ Build context

✓ Merge workspace files

✓ Merge conversation history

✓ Compress context

✓ Validate context

✓ Preview final prompt

✓ Cache reused

✓ Duplicate removal works

---

# Automated Verification

```bash
pnpm --filter @ocs/context test

pnpm validate

pnpm lint

pnpm typecheck
```

Coverage Target

```
>=90%
```

Performance Targets

| Metric        | Target |
| ------------- | ------ |
| Context Build | <50 ms |
| Optimization  | <30 ms |
| Validation    | <10 ms |
| Cache Lookup  | <5 ms  |

---

# Acceptance Criteria

The Context Manager is complete when:

- All AI requests pass through ContextManager.
- Multiple context sources merge correctly.
- Priority-based truncation works.
- Compression reduces unnecessary tokens.
- Context preview is available.
- Future RAG and Agent contexts plug into the same architecture.

---

# Risks

| Risk                     | Mitigation            |
| ------------------------ | --------------------- |
| Oversized prompts        | Compression & pruning |
| Duplicate context        | Optimizer             |
| Slow prompt construction | Context cache         |
| Feature coupling         | Source abstraction    |

---

# Future Enhancements

- Semantic context ranking
- AI-assisted prompt compression
- Automatic context quality scoring
- Cross-agent shared context
- Distributed context cache
- Context replay
- Prompt lineage tracking

---

# Deliverables

- Context Platform
- Context Manager
- Context Builder
- Context Optimizer
- Context Validator
- Context Cache
- Context Inspector

---

# Traceability

Implements

- REQ-CONTEXT-001 Context Assembly
- REQ-CONTEXT-002 Context Optimization
- REQ-CONTEXT-003 Compression
- REQ-CONTEXT-004 Validation

Related ADRs

- ADR-047 Context Architecture
- ADR-048 Context Compression Pipeline

Related Events

- context.created
- context.optimized
- context.validated

Related Commands

- context.build
- context.optimize
- context.preview

---

# Epic Completion Summary

**Target Release:** **v0.2.0 Alpha**

The Context Manager establishes a centralized context construction platform for Open-Code.Studio. By assembling, optimizing, validating, and compressing prompt context before execution, it ensures efficient utilization of model context windows while providing a scalable foundation for future RAG, Memory, Knowledge Engine, Agents, and Workflow capabilities.

---

# Changelog

## v1.0.0 (Planned)

- Initial Context Manager specification.
- Added ContextManager, Builder, Optimizer, Validator, Compression Engine, Context Cache, Inspector, commands, events, APIs, and unified context pipeline.
