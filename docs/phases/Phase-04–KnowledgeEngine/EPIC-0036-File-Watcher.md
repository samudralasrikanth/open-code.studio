# EPIC-0036 — File Watcher

| Property           | Value                                                                              |
| ------------------ | ---------------------------------------------------------------------------------- |
| Epic ID            | EPIC-0036                                                                          |
| Phase              | Phase 4 – Knowledge Engine                                                         |
| Status             | 📋 Planned                                                                         |
| Priority           | Critical                                                                           |
| Estimated Duration | 2 Weeks                                                                            |
| Dependencies       | EPIC-0035 Workspace Scanner                                                        |
| Blocks             | EPIC-0037 Language Parsers, EPIC-0038 Symbol Extraction, EPIC-0043 Knowledge Store |

---

# Overview

The File Watcher continuously monitors the workspace for file system changes and feeds incremental updates into the Knowledge Engine.

Unlike the Workspace Scanner, which performs full discovery, the File Watcher observes changes after the initial scan and ensures the knowledge graph remains synchronized with the workspace in real time.

Every modification inside the workspace passes through the File Watcher.

---

# Vision

Build a scalable, cross-platform file watching platform capable of monitoring hundreds of thousands of files with minimal CPU and memory usage.

Supported operations:

- File Create
- File Modify
- File Delete
- File Rename
- Directory Create
- Directory Delete
- Move
- Symlink changes

---

# Objectives

## Functional

- Real-time monitoring
- Incremental updates
- Debouncing
- Event batching
- Directory watching
- Rename detection
- Ignore rule support
- Watch recovery
- Diagnostics
- Event publishing

## Non-Functional

- Cross-platform
- Low latency
- Low CPU usage
- Low memory usage
- Event driven
- Fault tolerant

---

# Scope

Included

- File Watch Service
- Event Processing
- Ignore Engine Integration
- Debouncing
- Batch Processing
- Recovery

Excluded

- Parsing
- Symbol extraction
- Embeddings
- Semantic indexing

---

# Architecture

```
Workspace

↓

Native File System

↓

File Watch Service

↓

Event Processor

↓

Knowledge Pipeline

↓

Parser
```

---

# Package Structure

```
packages/file-watcher/

domain/
    FileEvent
    WatchSession
    WatchState
    WatchStatistics

application/
    FileWatchService
    EventProcessor
    DebounceEngine
    RecoveryService

platform/
    LinuxWatcher
    MacWatcher
    WindowsWatcher

events/
    FileWatcherEvents

commands/
    FileWatcherCommands
```

---

# Core Components

## File Watch Service

Responsibilities

- Start watchers
- Stop watchers
- Publish events
- Maintain watch sessions

Acts as the entry point for workspace monitoring.

---

## Event Processor

Processes

- Create
- Update
- Delete
- Rename
- Move

Normalizes platform-specific events.

---

## Debounce Engine

Combines rapid file changes into single logical events.

Example

```
Save File

↓

20 Write Events

↓

1 Modified Event
```

---

## Recovery Service

Automatically restores file watchers after:

- OS sleep
- Network reconnection
- File system errors
- Watch overflow

---

# Watch Lifecycle

```
Workspace Open

↓

Create Watchers

↓

Receive Events

↓

Normalize

↓

Debounce

↓

Publish

↓

Knowledge Engine
```

---

# File Event

```typescript
id;

type;

path;

oldPath;

timestamp;

workspace;

metadata;
```

---

# Event Types

```
Created

Modified

Deleted

Renamed

Moved

DirectoryCreated

DirectoryDeleted
```

---

# Watch States

```
Starting

Watching

Paused

Recovering

Stopped

Failed
```

---

# Supported Platforms

| Platform | Backend               |
| -------- | --------------------- |
| Windows  | ReadDirectoryChangesW |
| macOS    | FSEvents              |
| Linux    | inotify               |

---

# Renderer Components

```
FileWatcherStatus

EventMonitor

WatchStatistics

RecoveryPanel

Diagnostics
```

---

# Commands

```
watch.start

watch.stop

watch.restart

watch.statistics

watch.refresh
```

---

# Events

```
watch.started

watch.fileCreated

watch.fileModified

watch.fileDeleted

watch.fileRenamed

watch.recovered
```

---

# APIs

## FileWatchService

```typescript
start();

stop();

restart();

statistics();

status();

sessions();
```

---

# IPC Contracts

Renderer

```typescript
window.ocs.fileWatcher;

start();

stop();

status();

statistics();
```

Main

```
watch:start

watch:stop

watch:status

watch:statistics
```

---

# Stories

## STORY-0036-001

Watch Domain

Tasks

- FileEvent
- WatchSession
- WatchState
- Statistics

---

## STORY-0036-002

Watch Service

Tasks

- Watch lifecycle
- Event publishing
- Session management

---

## STORY-0036-003

Event Processing

Tasks

- Normalize events
- Batch events
- Debounce

---

## STORY-0036-004

Platform Watchers

Tasks

- Windows
- Linux
- macOS

---

## STORY-0036-005

Recovery

Tasks

- Overflow recovery
- Reconnect
- Diagnostics

---

## STORY-0036-006

UI

Tasks

- Event monitor
- Statistics
- Diagnostics

---

# Complete Task Checklist

## Domain

- [ ] FileEvent
- [ ] WatchSession
- [ ] WatchState
- [ ] Statistics

## Application

- [ ] FileWatchService
- [ ] EventProcessor
- [ ] DebounceEngine
- [ ] RecoveryService

## Infrastructure

- [ ] Windows watcher
- [ ] Linux watcher
- [ ] macOS watcher

## Renderer

- [ ] Event Monitor
- [ ] Status
- [ ] Statistics
- [ ] Recovery panel

## Validation

- [ ] Unit tests
- [ ] Integration tests
- [ ] Cross-platform tests
- [ ] Stress tests

---

# Manual Verification

✓ File create detected

✓ File delete detected

✓ Rename detected

✓ Multiple saves debounced

✓ Watch recovery works

✓ Ignore rules respected

✓ Large workspaces remain responsive

---

# Automated Verification

```bash
pnpm --filter @ocs/file-watcher test

pnpm validate

pnpm lint

pnpm typecheck
```

Coverage Target

```
>=90%
```

Performance Targets

| Metric              | Target   |
| ------------------- | -------- |
| Event Detection     | <50 ms   |
| Debounce Processing | <10 ms   |
| Watch Recovery      | <2 sec   |
| CPU Usage           | <2% idle |

---

# Acceptance Criteria

The File Watcher is complete when:

- File system events are detected in real time.
- Platform differences are abstracted.
- Duplicate events are debounced.
- Watch sessions recover automatically after failures.
- The Knowledge Engine receives incremental updates without rescanning the workspace.
- Large repositories remain responsive.

---

# Risks

| Risk                     | Mitigation          |
| ------------------------ | ------------------- |
| Watch overflow           | Automatic recovery  |
| Duplicate OS events      | Debounce engine     |
| Platform inconsistencies | Normalization layer |
| High CPU usage           | Event batching      |

---

# Future Enhancements

- Remote filesystem watching
- Cloud workspace watching
- Git-aware watching
- AI-assisted change prioritization
- Distributed workspace monitoring
- File change replay

---

# Deliverables

- File Watch Platform
- File Watch Service
- Event Processor
- Debounce Engine
- Recovery Service
- Diagnostics Dashboard

---

# Traceability

Implements

- REQ-KNOW-005 File Watching
- REQ-KNOW-006 Incremental Updates
- REQ-KNOW-007 Event Processing
- REQ-KNOW-008 Watch Recovery

Related ADRs

- ADR-084 File Watching Architecture
- ADR-085 Event Normalization
- ADR-086 Incremental Knowledge Updates

Related Events

- watch.started
- watch.fileModified
- watch.fileDeleted
- watch.recovered

Related Commands

- watch.start
- watch.stop
- watch.statistics

---

# Epic Completion Summary

**Target Release:** **v0.4.0 Alpha**

The File Watcher provides real-time synchronization between the workspace and the Knowledge Engine. By monitoring file system changes, normalizing platform-specific events, and delivering incremental updates, it eliminates expensive rescans while ensuring the knowledge graph accurately reflects the current state of the workspace.

---

# Changelog

## v1.0.0 (Planned)

- Initial File Watcher specification.
- Added FileWatchService, Event Processor, Debounce Engine, Recovery Service, platform watchers, diagnostics, commands, events, APIs, and incremental update architecture.
