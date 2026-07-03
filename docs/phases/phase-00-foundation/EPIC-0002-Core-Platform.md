# EPIC-0002 — Core Platform

| Property           | Value                                         |
| ------------------ | --------------------------------------------- |
| Epic ID            | EPIC-0002                                     |
| Phase              | Phase 0 – Foundation                          |
| Status             | ✅ Completed                                  |
| Priority           | Critical                                      |
| Estimated Duration | 2 Weeks                                       |
| Dependencies       | EPIC-0001 Repository Foundation               |
| Blocks             | EPIC-0003 Desktop Bootstrap, All Future Epics |

---

# Overview

The Core Platform provides the reusable infrastructure that every subsystem within Open-Code.Studio depends upon.

Instead of allowing each package to solve common problems independently, this epic introduces shared platform services for dependency injection, logging, configuration, lifecycle management, events, telemetry, health monitoring, and error handling.

No platform package in Open-Code.Studio should implement its own logger, event bus, configuration loader, or dependency container.

This epic defines those standards.

---

# Vision

Provide a unified platform layer that offers:

- Consistent dependency management
- Structured logging
- Typed event-driven communication
- Immutable configuration
- Standardized error handling
- Lifecycle orchestration
- Telemetry and diagnostics
- Health monitoring

These services are framework-independent and contain **no Electron or React dependencies**.

---

# Goals

## Functional Goals

- Build Dependency Injection container
- Build Logger Platform
- Build Event Bus
- Build Configuration Platform
- Build Lifecycle Manager
- Build Telemetry Platform
- Build Health Check Platform
- Build Platform Error system
- Build Common Utilities
- Define shared contracts and interfaces

## Non-Functional Goals

- Zero global mutable state
- Fully typed APIs
- Platform agnostic
- Easily testable
- Observable
- High performance
- Thread-safe where applicable

---

# Scope

Included

- Dependency Injection
- Logger
- Event Bus
- Lifecycle
- Configuration
- Platform Errors
- Telemetry
- Health Monitoring
- Shared Contracts
- Shared Types
- Utility Packages

Excluded

- Electron
- React
- Workspace
- Explorer
- Editor
- Runtime
- AI
- Plugins

---

# Architecture

## Platform Layer

```
Applications
        │
        ▼
Platform Services
        │
        ▼
Shared Contracts
        │
        ▼
Infrastructure
```

Applications depend only on interfaces.

Implementations are registered through Dependency Injection.

---

# Core Components

## 1. Dependency Injection Platform

Package

```
packages/common/di
```

Responsibilities

- Service registration
- Singleton management
- Factory registration
- Scoped services
- Constructor injection
- Lifetime management

Example

```ts
container.registerSingleton(Logger);
container.registerSingleton(EventBus);

const logger = container.resolve(Logger);
```

Acceptance

- No manual singleton creation.
- All services resolved through DI.

---

## 2. Logger Platform

Package

```
packages/common/logger
```

Responsibilities

- Structured logging
- Log levels
- Categories
- Flow logging
- Correlation IDs
- Error logging
- Performance logging

Supported Levels

- Trace
- Debug
- Info
- Warn
- Error
- Fatal

Future

- File logging
- Remote logging
- Log streaming

---

## 3. Configuration Platform

Package

```
packages/common/config
```

Responsibilities

- Load configuration
- Immutable access
- Environment overrides
- Defaults
- Validation

Configuration Sources

- Default config
- Environment variables
- User configuration
- Workspace configuration

---

## 4. Event Bus

Package

```
packages/common/events
```

Responsibilities

- Publish
- Subscribe
- Unsubscribe
- Typed events
- Async dispatch

Example Events

```
workspace.opened

workspace.closed

document.saved

editor.changed

explorer.refreshed
```

Future

Supports distributed event routing.

---

## 5. Lifecycle Manager

Responsibilities

- Startup
- Ready
- Shutdown
- Dispose
- Restart

Lifecycle

```
Initialize

↓

Configure

↓

Start

↓

Ready

↓

Shutdown

↓

Dispose
```

---

## 6. Platform Errors

Responsibilities

- Strongly typed errors
- Categories
- Error codes
- Root cause tracking

Categories

- Configuration
- Validation
- Workspace
- Explorer
- Editor
- Runtime
- Network
- Security
- Unknown

---

## 7. Telemetry Platform

Responsibilities

- Startup timing
- Service timings
- Performance metrics
- Memory usage
- CPU usage
- Event timings

Future

OpenTelemetry integration.

---

## 8. Health Platform

Responsibilities

Expose subsystem health.

Example

```json
{
  "logger": "ok",
  "eventBus": "ok",
  "workspace": "ok",
  "explorer": "ok"
}
```

Used by diagnostics.

---

# Stories

## STORY-0008 — Dependency Injection

Tasks

- Implement Container
- Singleton registration
- Factory registration
- Scoped lifetime
- Service resolution

Acceptance

All services resolved via DI.

---

## STORY-0009 — Logger

Tasks

- Structured logger
- Levels
- Categories
- Flow logging
- Correlation IDs

Acceptance

No direct console logging outside bootstrap/debug utilities.

---

## STORY-0010 — Configuration

Tasks

- Configuration loader
- Validation
- Defaults
- Immutable access

Acceptance

Configuration cannot be modified after initialization.

---

## STORY-0011 — Event Bus

Tasks

- Publish
- Subscribe
- Async dispatch
- Typed payloads

Acceptance

Subsystems communicate only through events where appropriate.

---

## STORY-0012 — Lifecycle

Tasks

- Startup phases
- Shutdown phases
- Disposal
- Service ordering

Acceptance

Startup and shutdown are deterministic.

---

## STORY-0013 — Platform Errors

Tasks

- Error base class
- Categories
- Codes
- Serialization

Acceptance

All platform errors derive from PlatformError.

---

## STORY-0014 — Telemetry

Tasks

- Timers
- Counters
- Metrics
- Performance reporting

Acceptance

Startup timing available through diagnostics.

---

## STORY-0015 — Health Checks

Tasks

- Health endpoint
- Diagnostics endpoint
- Status reporting
- Dependency validation

Acceptance

Every subsystem reports health.

---

# Complete Task Checklist

## Dependency Injection

- [x] Container
- [x] Singleton registration
- [x] Factory registration
- [x] Lifetime management
- [x] Resolution

## Logger

- [x] Levels
- [x] Structured logging
- [x] Flow logging
- [x] Correlation IDs

## Configuration

- [x] Immutable configuration
- [x] Validation
- [x] Environment overrides

## Event Bus

- [x] Publish
- [x] Subscribe
- [x] Typed events

## Lifecycle

- [x] Startup
- [x] Shutdown
- [x] Disposal

## Errors

- [x] PlatformError
- [x] Categories
- [x] Codes

## Telemetry

- [x] Startup metrics
- [x] Performance metrics

## Diagnostics

- [x] Health endpoint
- [x] Diagnostics endpoint

---

# Public APIs

## Container

```ts
registerSingleton();
registerFactory();
resolve();
dispose();
```

## Logger

```ts
trace();
debug();
info();
warn();
error();
fatal();
flow();
```

## EventBus

```ts
publish();
subscribe();
unsubscribe();
```

## Configuration

```ts
get();
has();
```

## Lifecycle

```ts
initialize();
start();
shutdown();
dispose();
```

---

# Events

Core Events

```
platform.initializing

platform.ready

platform.shutdown

platform.disposed

service.registered

service.disposed

health.changed
```

---

# Verification

## Automated

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm validate
```

Expected

- All platform tests pass.
- No dependency violations.
- Architecture validation succeeds.

---

## Manual

Verify

- DI resolves services.
- Logger outputs structured logs.
- EventBus publishes/subscribes correctly.
- Health endpoint returns subsystem status.
- Startup sequence executes in correct order.
- Shutdown disposes services cleanly.

---

# Acceptance Criteria

This Epic is complete when:

- Every shared service is registered through DI.
- Logging is centralized.
- Configuration is immutable.
- EventBus is the standard communication mechanism.
- Lifecycle is deterministic.
- Health and diagnostics report platform status.
- Platform services contain no UI or Electron dependencies.

---

# Risks

| Risk                   | Mitigation                             |
| ---------------------- | -------------------------------------- |
| Service locator misuse | Constructor injection guidelines       |
| Event storms           | Typed events and controlled publishing |
| Hidden dependencies    | Explicit DI registration               |
| Configuration drift    | Immutable configuration model          |
| Logging overhead       | Configurable log levels                |

---

# Deliverables

- Dependency Injection Platform
- Logger Platform
- Configuration Platform
- Event Bus
- Lifecycle Manager
- Platform Errors
- Telemetry Platform
- Health Monitoring Platform
- Shared Contracts

---

# Epic Completion Summary

**Status:** ✅ Complete

**Outcome:**

Open-Code.Studio now has a reusable platform layer that all future packages rely on. The platform is framework-agnostic, testable, observable, and enforces consistent engineering practices across the entire codebase.

---

# Changelog

## v1.0.0

- Introduced Dependency Injection container.
- Added structured logging with flow logging support.
- Implemented typed Event Bus.
- Added immutable configuration platform.
- Added lifecycle management.
- Implemented PlatformError hierarchy.
- Added telemetry and diagnostics infrastructure.
- Established health monitoring APIs.
