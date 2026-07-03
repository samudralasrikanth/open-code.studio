# EPIC-0008 — Git Integration

| Property           | Value                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------- |
| Epic ID            | EPIC-0008                                                                                |
| Phase              | Phase 1 – IDE Platform                                                                   |
| Status             | 📋 Planned                                                                               |
| Priority           | Critical                                                                                 |
| Estimated Duration | 3 Weeks                                                                                  |
| Dependencies       | EPIC-0004 Workspace, EPIC-0005 Explorer, EPIC-0006 Document & Editor, EPIC-0007 Terminal |
| Blocks             | EPIC-0010 Global Search, Phase 4 Knowledge Engine                                        |

---

# Overview

The Git Platform introduces first-class source control capabilities into Open-Code.Studio. Rather than wrapping Git CLI commands directly in the UI, Git is implemented as an independent platform responsible for repository discovery, status tracking, branching, commits, synchronization, and repository events.

The Explorer, Editor, Status Bar, Terminal, AI Agents, and Workflow Engine consume Git through this platform.

---

# Vision

Provide a Git experience comparable to VS Code while exposing a rich API that future AI agents and workflows can leverage.

Future capabilities include:

- Local repositories
- Monorepos
- Multi-root repositories
- GitHub
- GitLab
- Azure DevOps
- Bitbucket
- Enterprise Git servers

without changing the platform architecture.

---

# Objectives

## Functional

- Detect Git repositories
- Repository status
- Branch management
- Stage/Unstage
- Commit
- Push
- Pull
- Fetch
- Clone
- Checkout
- Diff viewer
- Explorer decorations
- Source Control panel

## Non-Functional

- Platform independent
- Event driven
- Incremental refresh
- Large repository support
- Async operations
- Background monitoring

---

# Scope

Included

- Git Platform
- Repository discovery
- GitService
- Source Control panel
- Explorer decorations
- Status bar integration
- Branch management
- Commit workflow
- File diffs

Excluded

- Pull Requests
- Merge editor
- Conflict resolution UI
- GitHub Issues
- Code Review
- CI/CD

---

# Architecture

```
Workbench

↓

Source Control View

↓

Git Service

↓

Repository Manager

↓

Git Provider

↓

Git Executable / libgit2
```

The UI never executes Git directly.

---

# Package Structure

```
packages/git/

domain/
    GitRepository
    GitBranch
    GitCommit
    GitStatus
    GitDiff

application/
    GitService
    RepositoryManager
    GitWatcher
    GitHistoryService

infrastructure/
    GitCliProvider
    GitProcessRunner

events/
    GitEvents

commands/
    GitCommands
```

---

# Core Components

## Git Service

Responsibilities

- Discover repositories
- Execute Git operations
- Track repository state
- Publish events

Acts as the central Git API.

---

## Repository Manager

Responsibilities

- Repository detection
- Active repository
- Multi-root support
- Background refresh

---

## Git Watcher

Monitors

- HEAD changes
- Index changes
- Working tree
- Branch updates

Refreshes state incrementally.

---

## Git Provider

Current implementation

```
Git CLI
```

Future

- libgit2
- JGit
- Remote Git Provider

---

# Git Status

Tracks

- Modified
- Added
- Deleted
- Renamed
- Untracked
- Ignored
- Conflicted

---

# Explorer Decorations

Decorations include

- Modified
- Added
- Deleted
- Ignored
- Conflicted

Provided through the Explorer Decoration Registry.

---

# Source Control View

Contains

- Changes
- Staged Changes
- Commit Message
- Branch Selector
- Repository Status
- Incoming/Outgoing

---

# Status Bar

Displays

- Current Branch
- Sync Status
- Repository State

Future

- Pull Request status
- CI status

---

# Renderer Components

```
SourceControlPanel

CommitBox

ChangesTree

BranchPicker

GitStatusBar

DiffViewer
```

---

# Commands

```
git.clone

git.init

git.fetch

git.pull

git.push

git.commit

git.stage

git.unstage

git.checkout

git.branch.create

git.branch.delete

git.refresh
```

---

# Events

```
git.repositoryOpened

git.repositoryClosed

git.statusChanged

git.branchChanged

git.commitCreated

git.fetchCompleted

git.pullCompleted

git.pushCompleted
```

---

# APIs

## GitService

```
discover()

status()

commit()

push()

pull()

fetch()

checkout()

stage()

unstage()

branches()

history()
```

---

# IPC Contracts

Renderer

```
window.ocs.git

status()

commit()

push()

pull()

fetch()

checkout()

history()
```

Main

```
git:status

git:commit

git:push

git:pull

git:checkout

git:history
```

---

# Stories

## STORY-0008-001

Repository Discovery

Tasks

- Detect repositories
- Multi-root support
- Active repository

---

## STORY-0008-002

Git Status

Tasks

- Working tree
- Index
- Branch
- Status refresh

---

## STORY-0008-003

Git Operations

Tasks

- Commit
- Push
- Pull
- Fetch
- Checkout

---

## STORY-0008-004

Explorer Decorations

Tasks

- Modified icons
- Added icons
- Deleted icons
- Conflict icons

---

## STORY-0008-005

Source Control Panel

Tasks

- Commit UI
- Changes list
- Branch selector

---

## STORY-0008-006

Diff Viewer

Tasks

- Inline diff
- Side-by-side diff
- Syntax highlighting

---

## STORY-0008-007

Background Watcher

Tasks

- Watch HEAD
- Refresh status
- Publish events

---

# Complete Task Checklist

## Domain

- [ ] Repository model
- [ ] Branch model
- [ ] Commit model
- [ ] Diff model

## Application

- [ ] GitService
- [ ] RepositoryManager
- [ ] HistoryService
- [ ] Watcher

## Infrastructure

- [ ] Git CLI provider
- [ ] Process runner

## Renderer

- [ ] SCM panel
- [ ] Branch picker
- [ ] Commit box
- [ ] Diff viewer

## Explorer

- [ ] Decorations
- [ ] Status badges

## Commands

- [ ] Git command registration
- [ ] Keyboard shortcuts

## Validation

- [ ] Unit tests
- [ ] Integration tests

---

# Manual Verification

✓ Repository detected

✓ Branch shown

✓ Explorer decorations appear

✓ Stage file

✓ Commit changes

✓ Push repository

✓ Pull changes

✓ Switch branches

✓ View diff

---

# Automated Verification

```bash
pnpm --filter @ocs/git test

pnpm validate

pnpm lint

pnpm typecheck
```

Coverage Target

```
>=90%
```

---

# Acceptance Criteria

The Git Platform is complete when:

- Git repositories are automatically detected.
- Repository status updates in real time.
- Explorer shows Git decorations.
- Commit, push, pull, and checkout operations work correctly.
- Source Control panel reflects repository state.
- All Git functionality routes through GitService.

---

# Risks

| Risk                  | Mitigation           |
| --------------------- | -------------------- |
| Large repositories    | Incremental refresh  |
| Git CLI differences   | Provider abstraction |
| Blocking UI           | Async operations     |
| Status refresh storms | Debounced watcher    |
| Multi-root complexity | Repository manager   |

---

# Future Enhancements

- Pull Requests
- Merge Conflict Editor
- Interactive Rebase
- GitHub Integration
- GitLab Integration
- AI Commit Messages
- AI Code Review
- Blame View
- Timeline View

---

# Deliverables

- Git Platform
- GitService
- Repository Manager
- Source Control View
- Explorer Decorations
- Branch Management
- Diff Viewer
- Git Commands

---

# Traceability

Implements

- REQ-GIT-001 Repository Discovery
- REQ-GIT-002 Source Control
- REQ-GIT-003 Branch Management
- REQ-GIT-004 Commit Workflow

Related ADRs

- ADR-018 Git Platform
- ADR-019 Repository Manager

Related Events

- git.statusChanged
- git.branchChanged
- git.commitCreated

Related Commands

- git.commit
- git.pull
- git.push
- git.checkout

---

# Epic Completion Summary

**Target Release:** v0.1.0 Alpha

This epic introduces a complete Git Platform that separates repository management from the user interface. The platform becomes the single source of truth for all Git operations and serves as the foundation for Source Control, AI-assisted development, Workflow Automation, and future enterprise integrations.

---

# Changelog

## v1.0.0 (Planned)

- Initial Git Platform specification.
- Added GitService, RepositoryManager, Source Control panel, Explorer decorations, Diff Viewer, Git commands, events, and provider architecture.
