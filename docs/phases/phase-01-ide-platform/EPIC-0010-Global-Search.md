# EPIC-0010 — Global Search

| Property           | Value                                                                               |
| ------------------ | ----------------------------------------------------------------------------------- |
| Epic ID            | EPIC-0010                                                                           |
| Phase              | Phase 1 – IDE Platform                                                              |
| Status             | 📋 Planned                                                                          |
| Priority           | Critical                                                                            |
| Estimated Duration | 2–3 Weeks                                                                           |
| Dependencies       | EPIC-0004 Workspace, EPIC-0005 Explorer, EPIC-0006 Document & Editor, EPIC-0008 Git |
| Blocks             | Phase 4 Knowledge Engine (Workspace Scanner, Semantic Search)                       |

---

# Overview

The Global Search Platform provides high-performance text search across the workspace. Rather than implementing search inside the renderer, it introduces a reusable Search Platform that supports full-text search, replace operations, regular expressions, search providers, and future semantic search.

The platform is designed so that traditional text search and AI-powered semantic search share a common architecture.

---

# Vision

Create a scalable search platform capable of supporting:

- Workspace Search
- Replace in Files
- Regex Search
- Symbol Search
- File Search
- Semantic Search
- AI Search
- Remote Workspace Search

without changing the core architecture.

---

# Objectives

## Functional

- Find in Files
- Replace in Files
- Regex Search
- Match Case
- Whole Word
- Include Patterns
- Exclude Patterns
- Incremental Results
- Search History
- Saved Searches

## Non-Functional

- Millions of files
- Streaming results
- Parallel execution
- Provider architecture
- Event driven
- Extensible

---

# Scope

Included

- Search Platform
- Search Service
- Ripgrep integration
- Replace engine
- Search providers
- Search results panel
- Search history
- Search filters

Excluded

- Semantic Search
- AI Ranking
- Symbol Search
- Code Graph Search
- Remote Search

---

# Architecture

```
Search Panel

↓

Search Service

↓

Search Provider

↓

Ripgrep Adapter

↓

Workspace Files
```

The renderer never performs filesystem searching.

---

# Package Structure

```
packages/search/

domain/
    SearchQuery
    SearchResult
    SearchMatch
    ReplaceOperation

application/
    SearchService
    ReplaceService
    SearchHistory
    SearchManager

providers/
    RipgrepProvider
    SearchProvider

events/
    SearchEvents

commands/
    SearchCommands
```

---

# Core Components

## Search Service

Responsibilities

- Execute searches
- Manage providers
- Stream results
- Cancel searches
- Publish events

Acts as the platform entry point.

---

## Search Provider

Current implementation

```
RipgrepProvider
```

Future providers

- Semantic Search
- Symbol Search
- Git Search
- AI Search
- Extension Providers

---

## Replace Service

Responsibilities

- Replace single match
- Replace all
- Preview replacements
- Undo replace operation

Future

Transaction-aware replacement.

---

## Search History

Tracks

- Previous queries
- Filters
- Replace history
- Favorite searches

---

## Incremental Search

Search results stream into the UI while scanning continues.

```
Start Search

↓

100 Results

↓

250 Results

↓

Completed
```

No waiting for the full search to complete.

---

# Search Query Model

```
text

replaceText

regex

matchCase

wholeWord

include

exclude

maxResults
```

---

# Search Result Model

```
file

line

column

preview

matches

score
```

---

# Renderer Components

```
SearchPanel

SearchInput

ReplaceInput

ResultsTree

ResultItem

SearchToolbar

SearchFilters
```

---

# Commands

```
search.find

search.replace

search.replaceAll

search.next

search.previous

search.clear

search.history

search.toggleRegex

search.toggleCase

search.toggleWholeWord
```

---

# Events

```
search.started

search.progress

search.resultFound

search.completed

search.cancelled

search.replaced
```

---

# APIs

## SearchService

```
search()

replace()

replaceAll()

cancel()

history()

providers()

registerProvider()
```

---

# IPC Contracts

Renderer

```
window.ocs.search

search()

replace()

replaceAll()

cancel()

history()
```

Main

```
search:start

search:replace

search:cancel

search:history
```

---

# Stories

## STORY-0010-001

Search Domain

Tasks

- Query model
- Result model
- Replace model

---

## STORY-0010-002

Ripgrep Provider

Tasks

- Execute search
- Stream results
- Parse output

---

## STORY-0010-003

Search Service

Tasks

- Search lifecycle
- Cancellation
- Progress events

---

## STORY-0010-004

Replace Engine

Tasks

- Replace
- Replace All
- Preview

---

## STORY-0010-005

Search UI

Tasks

- Search panel
- Results tree
- Filters
- Toolbar

---

## STORY-0010-006

History & Filters

Tasks

- Search history
- Saved searches
- Include/exclude filters

---

## STORY-0010-007

Provider Framework

Tasks

- Provider registry
- Future semantic providers
- Extension APIs

---

# Complete Task Checklist

## Domain

- [ ] SearchQuery
- [ ] SearchResult
- [ ] SearchMatch
- [ ] ReplaceOperation

## Application

- [ ] SearchService
- [ ] ReplaceService
- [ ] SearchHistory
- [ ] SearchManager

## Infrastructure

- [ ] Ripgrep provider
- [ ] Output parser
- [ ] Streaming engine

## Renderer

- [ ] Search panel
- [ ] Results tree
- [ ] Replace UI
- [ ] Search filters

## Commands

- [ ] Search commands
- [ ] Replace commands

## Validation

- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance benchmarks

---

# Manual Verification

✓ Search workspace

✓ Incremental results appear

✓ Regex search works

✓ Match case works

✓ Whole word works

✓ Replace one

✓ Replace all

✓ Cancel search

✓ Search history retained

---

# Automated Verification

```bash
pnpm --filter @ocs/search test

pnpm validate

pnpm lint

pnpm typecheck
```

Coverage Target

```
>=90%
```

Performance Targets

| Metric            | Target    |
| ----------------- | --------- |
| Search Startup    | <100 ms   |
| Results Streaming | Immediate |
| 1M Files          | Supported |
| Replace Preview   | <50 ms    |

---

# Acceptance Criteria

The Search Platform is complete when:

- Workspace-wide searches execute through the Search Service.
- Results stream into the UI while searching continues.
- Replace operations support preview and undo.
- Search filters work correctly.
- Search providers can be extended without changing the UI.
- The platform is ready for Semantic Search integration in Phase 4.

---

# Risks

| Risk                        | Mitigation            |
| --------------------------- | --------------------- |
| Large repositories          | Streaming results     |
| Slow regex searches         | Ripgrep optimization  |
| UI freezes                  | Async providers       |
| Future semantic integration | Provider architecture |
| Large replace operations    | Transaction batching  |

---

# Future Enhancements

- Semantic Search
- AI-ranked search results
- Symbol Search
- AST-aware replace
- Search across multiple workspaces
- Remote workspace search
- Git-aware search
- Saved search profiles

---

# Deliverables

- Search Platform
- Search Service
- Ripgrep Provider
- Replace Engine
- Search Results Panel
- Search History
- Search Filters
- Provider Framework

---

# Traceability

Implements

- REQ-SEARCH-001 Workspace Search
- REQ-SEARCH-002 Replace Engine
- REQ-SEARCH-003 Search Filters
- REQ-SEARCH-004 Provider Framework

Related ADRs

- ADR-022 Search Platform
- ADR-023 Search Provider Architecture

Related Events

- search.started
- search.resultFound
- search.completed

Related Commands

- search.find
- search.replace
- search.replaceAll

---

# Epic Completion Summary

**Target Release:** v0.1.0 Alpha

This epic introduces a scalable Search Platform that separates search execution from presentation. By using a provider-based architecture with streaming results, Open-Code.Studio establishes the foundation for future semantic search, AI-powered retrieval, symbol indexing, and code intelligence while delivering a professional "Find in Files" experience comparable to modern IDEs.

---

# Changelog

## v1.0.0 (Planned)

- Initial Search Platform specification.
- Added SearchService, ReplaceService, RipgrepProvider, Search UI, provider architecture, streaming results, commands, events, APIs, and extensibility model.
