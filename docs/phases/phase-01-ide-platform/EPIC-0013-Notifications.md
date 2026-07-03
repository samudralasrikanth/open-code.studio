# EPIC-0013 — Notification Platform

| Property           | Value                                                                           |
| ------------------ | ------------------------------------------------------------------------------- |
| Epic ID            | EPIC-0013                                                                       |
| Phase              | Phase 1 – IDE Platform                                                          |
| Status             | 📋 Planned                                                                      |
| Priority           | Medium                                                                          |
| Estimated Duration | 1–2 Weeks                                                                       |
| Dependencies       | EPIC-0002 Core Platform, EPIC-0009 Command Palette, EPIC-0011 Settings Platform |
| Blocks             | Workflow Engine, AI Agents, Runtime Platform                                    |

---

# Overview

The Notification Platform provides a centralized messaging and user feedback system for Open-Code.Studio. Every subsystem communicates user-facing information through this platform rather than directly displaying dialogs or toast messages.

The Notification Platform manages transient notifications, progress reporting, background tasks, confirmations, warnings, errors, and actionable messages while maintaining a consistent user experience.

---

# Vision

Create a professional notification system comparable to VS Code while extending it for AI workflows, long-running tasks, enterprise events, and collaborative activities.

Future consumers include:

- Workspace Platform
- Explorer
- Editor
- Git
- Terminal
- Runtime
- Gateway
- AI Agents
- Workflow Engine
- Extensions

---

# Objectives

## Functional

- Toast notifications
- Progress notifications
- Error messages
- Warning messages
- Information messages
- Success notifications
- Action buttons
- Background task progress
- Notification history
- Notification center

## Non-Functional

- Non-blocking UI
- Event-driven
- Deduplication
- Extensible
- Accessible
- Persistent history

---

# Scope

Included

- Notification Platform
- Notification Service
- Notification Center
- Progress Manager
- Toasts
- Actionable Notifications
- Background Progress

Excluded

- Email notifications
- Mobile notifications
- Slack integration
- Microsoft Teams integration

---

# Architecture

```
Platform Services

↓

Notification Service

↓

Notification Queue

↓

Renderer

↓

Toast / Center / Progress
```

No package renders notifications directly.

---

# Package Structure

```
packages/notifications/

domain/
    Notification
    NotificationAction
    ProgressNotification
    NotificationSeverity

application/
    NotificationService
    NotificationQueue
    NotificationHistory
    ProgressManager

renderer/
    ToastContainer
    NotificationCenter
    ProgressOverlay

events/
    NotificationEvents

commands/
    NotificationCommands
```

---

# Core Components

## Notification Service

Responsibilities

- Create notifications
- Queue notifications
- Dismiss notifications
- Execute actions
- Persist history

Acts as the single notification API.

---

## Notification Queue

Supports

- FIFO processing
- Deduplication
- Priority ordering
- Expiration

Priorities

```
Critical

High

Normal

Low
```

---

## Notification Model

```
id

title

message

severity

timestamp

actions

progress

source

persistent
```

---

## Progress Manager

Supports

- Background progress
- Determinate progress
- Indeterminate progress
- Cancellation
- Completion

Examples

- Git Clone
- AI Indexing
- Project Scan
- Model Download

---

## Notification Center

Displays

- Active notifications
- History
- Dismissed items
- Filter by severity
- Filter by source

---

# Notification Severity

```
Info

Success

Warning

Error

Critical
```

---

# Renderer Components

```
ToastContainer

Toast

NotificationCenter

ProgressBar

ProgressOverlay

ActionButton
```

---

# Commands

```
notifications.open

notifications.clear

notifications.dismiss

notifications.history

notifications.toggleCenter
```

---

# Events

```
notification.created

notification.updated

notification.dismissed

notification.completed

notification.actionExecuted
```

---

# APIs

## NotificationService

```
info()

success()

warning()

error()

critical()

progress()

dismiss()

history()

clear()
```

---

# IPC Contracts

Renderer

```
window.ocs.notifications

show()

dismiss()

history()

clear()
```

Main

```
notifications:show

notifications:dismiss

notifications:history
```

---

# Stories

## STORY-0013-001

Notification Domain

Tasks

- Notification model
- Severity
- Actions

---

## STORY-0013-002

Notification Service

Tasks

- Queue
- History
- Dismiss
- Priority

---

## STORY-0013-003

Progress Manager

Tasks

- Background tasks
- Progress updates
- Cancellation

---

## STORY-0013-004

Notification Center

Tasks

- History
- Filters
- Grouping

---

## STORY-0013-005

Toast UI

Tasks

- Toast rendering
- Animations
- Auto dismiss
- Accessibility

---

## STORY-0013-006

Actions

Tasks

- Retry
- Open Log
- Show Details
- Custom actions

---

# Complete Task Checklist

## Domain

- [ ] Notification model
- [ ] Progress model
- [ ] Severity model

## Application

- [ ] NotificationService
- [ ] Queue
- [ ] History
- [ ] ProgressManager

## Renderer

- [ ] Toast UI
- [ ] Notification Center
- [ ] Progress Overlay

## Commands

- [ ] Notification commands

## Validation

- [ ] Unit tests
- [ ] Integration tests

---

# Manual Verification

✓ Toast appears

✓ Warning displayed

✓ Error displayed

✓ Progress updates

✓ Cancel progress

✓ Notification history available

✓ Action buttons execute

✓ Notifications survive long-running tasks

---

# Automated Verification

```bash
pnpm --filter @ocs/notifications test

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

The Notification Platform is complete when:

- All user-facing messages route through NotificationService.
- Toasts and progress notifications render consistently.
- Background tasks report progress.
- Notification history is searchable.
- Action buttons execute associated commands.
- Extensions can publish notifications through the same platform.

---

# Risks

| Risk                 | Mitigation                      |
| -------------------- | ------------------------------- |
| Notification spam    | Deduplication and rate limiting |
| Lost critical errors | Persistent notifications        |
| UI clutter           | Queue management                |
| Blocking operations  | Async notification pipeline     |

---

# Future Enhancements

- AI notifications
- Workflow notifications
- Desktop OS notifications
- Email alerts
- Team notifications
- Rich Markdown notifications
- Notification analytics

---

# Deliverables

- Notification Platform
- Notification Service
- Notification Queue
- Progress Manager
- Notification Center
- Toast UI
- History Management

---

# Traceability

Implements

- REQ-NOTIFY-001 Toast Notifications
- REQ-NOTIFY-002 Progress Reporting
- REQ-NOTIFY-003 Notification Center
- REQ-NOTIFY-004 Actionable Notifications

Related ADRs

- ADR-028 Notification Platform
- ADR-029 Progress Reporting

Related Events

- notification.created
- notification.completed
- notification.dismissed

Related Commands

- notifications.open
- notifications.clear

---

# Epic Completion Summary

**Target Release:** v0.1.0 Alpha

The Notification Platform provides a centralized, event-driven messaging system for Open-Code.Studio. It standardizes user feedback across all subsystems, supports long-running operations with progress reporting, and establishes a scalable foundation for AI, workflow, and enterprise notifications.

---

# Changelog

## v1.0.0 (Planned)

- Initial Notification Platform specification.
- Added NotificationService, Progress Manager, Notification Center, Toast UI, queueing system, commands, events, APIs, and notification history.
