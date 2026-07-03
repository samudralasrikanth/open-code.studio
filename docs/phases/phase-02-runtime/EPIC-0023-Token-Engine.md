# EPIC-0023 — Token Engine

| Property           | Value                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| Epic ID            | EPIC-0023                                                                                                |
| Phase              | Phase 2 – Runtime                                                                                        |
| Status             | 📋 Planned                                                                                               |
| Priority           | Critical                                                                                                 |
| Estimated Duration | 2–3 Weeks                                                                                                |
| Dependencies       | EPIC-0016 Runtime Service, EPIC-0017 Model Registry, EPIC-0021 Memory Manager, EPIC-0022 Context Manager |
| Blocks             | Phase 3 Gateway, Phase 4 Knowledge Engine, Phase 6 Agent Platform                                        |

---

# Overview

The Token Engine is responsible for tokenization, token counting, context window validation, prompt budgeting, cost estimation, and tokenizer abstraction.

Rather than every provider implementing its own tokenizer logic, all requests pass through the Token Engine before execution.

The Token Engine ensures prompts fit within model limits while maximizing usable context.

---

# Vision

Provide a provider-independent tokenizer platform capable of supporting every AI model through a unified interface.

Supported tokenizer families include:

- OpenAI (tiktoken)
- Anthropic
- Gemini
- Llama
- Mistral
- Qwen
- DeepSeek
- Phi
- GGUF Models
- Future custom tokenizers

---

# Objectives

## Functional

- Tokenize prompts
- Count tokens
- Validate context windows
- Budget output tokens
- Estimate request cost
- Compare tokenizer outputs
- Cache tokenization
- Support streaming

## Non-Functional

- Provider independent
- Fast (<10ms)
- Cached
- Deterministic
- Extensible
- Observable

---

# Scope

Included

- Token Engine
- Tokenizer Registry
- Token Counter
- Budget Manager
- Cost Estimator
- Context Validator

Excluded

- Runtime execution
- Prompt engineering
- Context building
- Provider communication

---

# Architecture

```
Context Manager

↓

Token Engine

↓

Tokenizer Registry

↓

Model Tokenizer

↓

Validated Prompt

↓

Runtime Service
```

---

# Package Structure

```
packages/tokenizer/

domain/
    TokenRequest
    TokenResult
    TokenBudget
    Tokenizer

application/
    TokenEngine
    TokenCounter
    BudgetManager
    CostEstimator

providers/
    TikTokenProvider
    LlamaTokenizer
    GeminiTokenizer
    AnthropicTokenizer

cache/
    TokenCache

events/
    TokenEvents

commands/
    TokenCommands
```

---

# Core Components

## Token Engine

Responsibilities

- Tokenize prompts
- Count tokens
- Validate limits
- Estimate output
- Publish metrics

Acts as the single tokenizer entry point.

---

## Tokenizer Registry

Maintains

- Available tokenizers
- Model mappings
- Version compatibility
- Encoding metadata

---

## Budget Manager

Calculates

```
Model Context Window

-

Reserved Output Tokens

-

System Prompt

-

Conversation

-

Workspace Context

=

Available Prompt Budget
```

Prevents prompt overflow before execution.

---

## Cost Estimator

Calculates

- Input tokens
- Output tokens
- Estimated cost
- Provider pricing
- Runtime estimates

Future

Enterprise billing integration.

---

## Token Cache

Caches

- Frequently tokenized prompts
- Shared system prompts
- Workspace summaries
- Agent prompts

---

# Token Request

```typescript
id;

model;

provider;

prompt;

systemPrompt;

expectedOutput;

metadata;
```

---

# Token Result

```typescript
inputTokens;

outputBudget;

totalTokens;

contextLimit;

estimatedCost;

fitsContext;

warnings;
```

---

# Context Validation

Checks

- Maximum tokens
- Reserved output
- Provider limits
- Model limits
- Safety margins

---

# Supported Tokenizers

```
TikToken

SentencePiece

BPE

WordPiece

LlamaTokenizer

Custom
```

---

# Renderer Components

```
TokenInspector

TokenUsageChart

BudgetView

CostEstimator

TokenizerDebugger
```

---

# Commands

```
tokens.count

tokens.validate

tokens.compare

tokens.estimate

tokens.cache.clear
```

---

# Events

```
tokens.counted

tokens.validated

tokens.limitExceeded

tokens.cached

tokens.costEstimated
```

---

# APIs

## TokenEngine

```typescript
count();

validate();

estimate();

budget();

compare();

cache();

statistics();
```

---

# IPC Contracts

Renderer

```typescript
window.ocs.tokens;

count();

validate();

estimate();

budget();
```

Main

```
tokens:count

tokens:validate

tokens:estimate

tokens:budget
```

---

# Stories

## STORY-0023-001

Tokenizer Domain

Tasks

- TokenRequest
- TokenResult
- Budget model
- Tokenizer interface

---

## STORY-0023-002

Token Engine

Tasks

- Counting
- Validation
- Context limits

---

## STORY-0023-003

Tokenizer Registry

Tasks

- Registry
- Model mappings
- Versioning

---

## STORY-0023-004

Budget Manager

Tasks

- Budget calculation
- Output reservation
- Warnings

---

## STORY-0023-005

Cost Estimation

Tasks

- Provider pricing
- Token costs
- Runtime estimates

---

## STORY-0023-006

Token UI

Tasks

- Inspector
- Charts
- Budget
- Debugger

---

# Complete Task Checklist

## Domain

- [ ] TokenRequest
- [ ] TokenResult
- [ ] Budget
- [ ] Tokenizer

## Application

- [ ] TokenEngine
- [ ] Registry
- [ ] BudgetManager
- [ ] CostEstimator

## Infrastructure

- [ ] Tokenizer adapters
- [ ] Token cache

## Renderer

- [ ] Token inspector
- [ ] Cost estimator
- [ ] Budget viewer

## Validation

- [ ] Unit tests
- [ ] Integration tests
- [ ] Tokenizer compatibility tests

---

# Manual Verification

✓ Prompt token count

✓ Context validation

✓ Cost estimate

✓ Token budget calculation

✓ Multiple tokenizer support

✓ Cache improves performance

✓ Limit warnings shown

---

# Automated Verification

```bash
pnpm --filter @ocs/tokenizer test

pnpm validate

pnpm lint

pnpm typecheck
```

Coverage Target

```
>=90%
```

Performance Targets

| Metric             | Target |
| ------------------ | ------ |
| Token Count        | <10 ms |
| Budget Calculation | <5 ms  |
| Cache Hit          | >95%   |
| Cost Estimate      | <5 ms  |

---

# Acceptance Criteria

The Token Engine is complete when:

- Every AI request is tokenized before execution.
- Context limits are enforced.
- Budget calculations are accurate.
- Multiple tokenizer families are supported.
- Cost estimates are available.
- Runtime never exceeds a model's context window.

---

# Risks

| Risk                      | Mitigation                 |
| ------------------------- | -------------------------- |
| Tokenizer inconsistencies | Provider-specific adapters |
| Context overflow          | Budget validation          |
| Performance overhead      | Aggressive caching         |
| Pricing changes           | Dynamic provider pricing   |

---

# Future Enhancements

- Streaming token accounting
- Live token usage during typing
- Token optimization suggestions
- AI prompt compression
- Enterprise billing
- Token analytics
- Cross-provider tokenizer comparison

---

# Deliverables

- Token Engine
- Tokenizer Registry
- Budget Manager
- Cost Estimator
- Token Cache
- Token Inspector
- Validation Pipeline

---

# Traceability

Implements

- REQ-TOKEN-001 Token Counting
- REQ-TOKEN-002 Context Validation
- REQ-TOKEN-003 Budget Management
- REQ-TOKEN-004 Cost Estimation

Related ADRs

- ADR-049 Token Engine Architecture
- ADR-050 Token Budget Strategy

Related Events

- tokens.counted
- tokens.validated
- tokens.limitExceeded

Related Commands

- tokens.count
- tokens.validate
- tokens.estimate

---

# Epic Completion Summary

**Target Release:** **v0.2.0 Alpha**

The Token Engine provides a unified tokenization platform for Open-Code.Studio. It abstracts provider-specific tokenizers, enforces context limits, manages prompt budgets, estimates execution costs, and ensures every request is safe to execute before reaching the Runtime.

---

# Changelog

## v1.0.0 (Planned)

- Initial Token Engine specification.
- Added TokenEngine, Tokenizer Registry, Budget Manager, Cost Estimator, Token Cache, commands, events, APIs, validation, and runtime integration.
