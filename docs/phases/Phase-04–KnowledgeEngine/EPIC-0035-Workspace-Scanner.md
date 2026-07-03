# EPIC-0035 — Workspace Scanner

| Property           | Value                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Epic ID            | EPIC-0035                                                                                 |
| Phase              | Phase 4 – Knowledge Engine                                                                |
| Status             | 📋 Planned                                                                                |
| Priority           | Critical                                                                                  |
| Estimated Duration | 3 Weeks                                                                                   |
| Dependencies       | Phase 2 Runtime, Phase 3 Gateway, EPIC-0004 Workspace Management, EPIC-0005 File Explorer |
| Blocks             | EPIC-0036 File Watcher, EPIC-0037 Language Parsers, EPIC-0038 Symbol Extraction           |

---

# Overview

The Workspace Scanner is the entry point of the Knowledge Engine.

Its responsibility is to discover every relevant artifact inside a workspace and build the initial Knowledge Graph.

Instead of each subsystem scanning files independently, every scan goes through the Workspace Scanner.

The scanner discovers:

- Source code
- Documentation
- Configuration
- Build files
- Dependencies
- Git metadata
- Assets
- Tests
- AI configuration
- Ignore rules

The Workspace Scanner is the "crawler" for the Knowledge Engine.

---

# Vision

Build a high-performance incremental workspace indexing engine capable of scanning projects containing millions of files while remaining responsive.

Supported workspace types:

- Node.js
- Python
- Java
- C#
- Go
- Rust
- C++
- Flutter
- React Native
- Monorepos
- Polyrepos
- Future languages

---

# Objectives

## Functional

- Workspace discovery
- Project detection
- File enumeration
- Ignore rules
- Incremental scanning
- Metadata extraction
- Dependency discovery
- Project classification
- Scan history
- Scan diagnostics

## Non-Functional

- Incremental
- Parallel
- Event driven
- Memory efficient
- Cross platform
- Scalable

---

# Scope

Included

- Workspace Scanner
- Project Detection
- Ignore Engine
- Metadata Collector
- Scan Scheduler
- Diagnostics

Excluded

- File watching
- Parsing
- Symbol extraction
- Embeddings

---

# Architecture

```
Workspace

↓

Workspace Scanner

↓

Project Detector

↓

File Enumerator

↓

Metadata Collector

↓

Knowledge Pipeline
```

---

# Package Structure

```
packages/workspace-scanner/

domain/
    Workspace
    Project
    ScanJob
    ScanResult

application/
    WorkspaceScanner
    ProjectDetector
    ScanScheduler
    MetadataCollector

ignore/
    IgnoreEngine

storage/
    ScanDatabase

events/
    WorkspaceScannerEvents

commands/
    WorkspaceScannerCommands
```

---

# Core Components

## Workspace Scanner

Responsibilities

- Scan workspace
- Enumerate files
- Discover projects
- Publish events
- Produce scan results

Acts as the entry point for the Knowledge Engine.

---

## Project Detector

Detects

- Git repositories
- package.json
- pyproject.toml
- pom.xml
- Cargo.toml
- go.mod
- solution files
- workspace files

Supports nested projects.

---

## Ignore Engine

Supports

- .gitignore
- .ignore
- .dockerignore
- User ignore rules
- Generated files
- Binary files

---

## Metadata Collector

Collects

- File size
- Extension
- Language
- Encoding
- Last modified
- Hash
- Permissions

---

# Scan Lifecycle

```
Workspace Open

↓

Project Detection

↓

Ignore Processing

↓

File Enumeration

↓

Metadata Collection

↓

Knowledge Pipeline
```

---

# Scan Model

```typescript
id;

workspace;

status;

projects;

files;

duration;

errors;

startedAt;

completedAt;
```

---

# Scan States

```
Pending

Scanning

Completed

Cancelled

Failed
```

---

# Supported Files

- Source files
- Markdown
- JSON
- YAML
- XML
- Images (metadata only)
- Configuration
- Scripts

---

# Renderer Components

```
WorkspaceScannerView

ProjectExplorer

ScanProgress

ScanStatistics

DiagnosticsView
```

---

# Commands

```
workspace.scan

workspace.scan.cancel

workspace.scan.refresh

workspace.scan.statistics

workspace.scan.projects
```

---

# Events

```
workspace.scanStarted

workspace.projectDetected

workspace.fileDiscovered

workspace.scanCompleted

workspace.scanFailed
```

---

# APIs

## WorkspaceScanner

```typescript
scan();

cancel();

refresh();

projects();

statistics();

status();
```

---

# IPC Contracts

Renderer

```typescript
window.ocs.workspaceScanner;

scan();

projects();

statistics();

status();
```

Main

```
workspace:scan

workspace:projects

workspace:statistics
```

---

# Stories

## STORY-0035-001

Workspace Discovery

Tasks

- Root detection
- Nested projects
- Monorepos

---

## STORY-0035-002

Scanner

Tasks

- Enumeration
- Metadata
- Hashing

---

## STORY-0035-003

Ignore Engine

Tasks

- GitIgnore
- Custom ignore
- Binary filtering

---

## STORY-0035-004

Project Detection

Tasks

- Package managers
- Build systems
- Languages

---

## STORY-0035-005

Diagnostics

Tasks

- Statistics
- Duration
- Errors

---

## STORY-0035-006

UI

Tasks

- Progress
- Statistics
- Diagnostics

---

# Complete Task Checklist

## Domain

- [ ] Workspace
- [ ] Project
- [ ] ScanJob
- [ ] ScanResult

## Application

- [ ] WorkspaceScanner
- [ ] ProjectDetector
- [ ] ScanScheduler
- [ ] MetadataCollector

## Infrastructure

- [ ] Ignore engine
- [ ] Scan database

## Renderer

- [ ] Scanner view
- [ ] Progress
- [ ] Statistics

## Validation

- [ ] Unit tests
- [ ] Integration tests
- [ ] Large repository tests
- [ ] Performance tests

---

# Manual Verification

✓ Workspace detected

✓ Nested projects detected

✓ Git ignore honored

✓ Statistics displayed

✓ Incremental scans work

✓ Large repositories scan correctly

---

# Automated Verification

```bash
pnpm --filter @ocs/workspace-scanner test

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
| 100k Files          | <30 sec  |
| Metadata Collection | Parallel |
| Incremental Scan    | <2 sec   |
| Memory Usage        | <500 MB  |

---

# Acceptance Criteria

The Workspace Scanner is complete when:

- Large workspaces scan successfully.
- Nested projects are detected.
- Ignore rules are respected.
- Metadata is collected for every file.
- Incremental scans minimize rescanning.
- The Knowledge Engine receives a complete workspace inventory.

---

# Risks

| Risk                  | Mitigation           |
| --------------------- | -------------------- |
| Huge repositories     | Parallel scanning    |
| Slow disks            | Incremental indexing |
| Symlink loops         | Cycle detection      |
| Ignore rule conflicts | Priority resolution  |

---

# Future Enhancements

- Remote workspace scanning
- Git history indexing
- Distributed scanning
- Cloud workspace support
- AI-assisted project detection
- Incremental hash trees

---

# Deliverables

- Workspace Scanner
- Project Detector
- Ignore Engine
- Metadata Collector
- Scan Scheduler
- Scanner Dashboard

---

# Traceability

Implements

- REQ-KNOW-001 Workspace Discovery
- REQ-KNOW-002 Project Detection
- REQ-KNOW-003 File Enumeration
- REQ-KNOW-004 Metadata Collection

Related ADRs

- ADR-081 Workspace Scanning Architecture
- ADR-082 Incremental Scanning
- ADR-083 Ignore Processing

Related Events

- workspace.scanStarted
- workspace.projectDetected
- workspace.scanCompleted

Related Commands

- workspace.scan
- workspace.scan.statistics
- workspace.scan.projects

---

# Epic Completion Summary

**Target Release:** **v0.4.0 Alpha**

The Workspace Scanner establishes the foundation of the Knowledge Engine by discovering, classifying, and indexing every relevant artifact within a workspace. It provides high-performance incremental scanning, project detection, metadata collection, and ignore processing, supplying downstream parsing and indexing components with an accurate representation of the workspace.

---

# Changelog

## v1.0.0 (Planned)

- Initial Workspace Scanner specification.
- Added WorkspaceScanner, ProjectDetector, IgnoreEngine, MetadataCollector, ScanScheduler, commands, events, APIs, diagnostics, and incremental scanning architecture.
