# EPIC-0027 — Local Provider Platform

| Property           | Value                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Epic ID            | EPIC-0027                                                                                                                      |
| Phase              | Phase 3 – Gateway                                                                                                              |
| Status             | 📋 Planned                                                                                                                     |
| Priority           | Critical                                                                                                                       |
| Estimated Duration | 3 Weeks                                                                                                                        |
| Dependencies       | EPIC-0016 Runtime Service, EPIC-0017 Model Registry, EPIC-0019 Model Installer, EPIC-0025 Gateway Core, EPIC-0026 Provider SDK |
| Blocks             | EPIC-0029 Provider Registry, Phase 4 Knowledge Engine                                                                          |

---

# Overview

The Local Provider Platform enables Open-Code.Studio to execute AI models entirely on the user's machine through a unified provider abstraction.

Instead of Runtime interacting directly with Ollama, LM Studio, llama.cpp, or future local runtimes, all communication occurs through Local Providers implementing the Provider SDK.

This architecture allows users to switch local runtimes without affecting the rest of the IDE.

---

# Vision

Provide first-class support for local AI execution with enterprise-grade reliability.

Supported runtimes include:

- Ollama
- LM Studio
- llama.cpp
- vLLM (Local)
- ONNX Runtime
- TensorRT-LLM
- MLC LLM
- Future Local Providers

---

# Objectives

## Functional

- Local model execution
- Streaming
- Health monitoring
- Runtime discovery
- Auto reconnect
- Model synchronization
- Capability reporting
- Authentication (where applicable)
- Runtime configuration
- Diagnostics

## Non-Functional

- Offline capable
- Low latency
- Provider independent
- Fault tolerant
- Event driven
- Extensible

---

# Scope

Included

- Local Provider SDK implementation
- Runtime Discovery
- Runtime Health
- Model Synchronization
- Streaming
- Configuration
- Diagnostics

Excluded

- Cloud providers
- Billing
- Cost tracking
- Enterprise routing

---

# Architecture

```
Runtime

↓

Gateway

↓

Local Provider

↓

Runtime Adapter

↓

Ollama / LM Studio / llama.cpp
```

---

# Package Structure

```
packages/provider-local/

domain/
    LocalRuntime
    LocalProviderConfig
    RuntimeStatus

application/
    LocalProvider
    RuntimeDiscovery
    RuntimeHealthService
    ModelSynchronizer

providers/
    OllamaProvider
    LMStudioProvider
    LlamaCppProvider

streaming/
    LocalStreamAdapter

events/
    LocalProviderEvents

commands/
    LocalProviderCommands
```

---

# Core Components

## Local Provider

Responsibilities

- Execute requests
- Stream responses
- Query models
- Health monitoring
- Diagnostics

Implements Provider SDK.

---

## Runtime Discovery

Discovers

- Installed runtimes
- Running runtimes
- Ports
- Versions
- Supported APIs

---

## Model Synchronizer

Synchronizes

- Installed models
- Runtime metadata
- Model status
- Context length
- Quantization

Updates Model Registry automatically.

---

## Runtime Health Service

Monitors

- Availability
- Startup
- Shutdown
- Latency
- Failures
- Auto reconnect

---

# Supported Local Providers

| Provider     | Initial Support |
| ------------ | --------------- |
| Ollama       | ✅              |
| LM Studio    | ✅              |
| llama.cpp    | ✅              |
| ONNX Runtime | Planned         |
| TensorRT     | Planned         |
| vLLM         | Planned         |

---

# Local Provider Configuration

```yaml
provider:
runtimePath:
endpoint:
port:
timeout:
autoReconnect:
preferredModels:
```

---

# Runtime States

```
Offline

Starting

Ready

Busy

Updating

Stopping

Unavailable
```

---

# Streaming

Supports

- HTTP Streaming
- SSE
- Local callbacks
- Chunk streaming

Unified through StreamAdapter.

---

# Renderer Components

```
LocalProviderManager

RuntimeDiscoveryView

InstalledModels

RuntimeHealth

DiagnosticsPanel
```

---

# Commands

```
local.scan

local.connect

local.disconnect

local.refresh

local.restart

local.models
```

---

# Events

```
local.runtimeDetected

local.runtimeConnected

local.runtimeDisconnected

local.modelsUpdated

local.healthChanged
```

---

# APIs

## LocalProvider

```typescript
connect();

disconnect();

execute();

stream();

models();

health();

restart();
```

---

# IPC Contracts

Renderer

```typescript
window.ocs.local;

scan();

connect();

disconnect();

health();

models();
```

Main

```
local:scan

local:connect

local:disconnect

local:health

local:models
```

---

# Stories

## STORY-0027-001

Runtime Discovery

Tasks

- Detect runtimes
- Detect ports
- Detect versions

---

## STORY-0027-002

Local Provider

Tasks

- Provider implementation
- Streaming
- Health

---

## STORY-0027-003

Model Synchronization

Tasks

- Registry updates
- Runtime sync
- Metadata

---

## STORY-0027-004

Health Monitoring

Tasks

- Health checks
- Auto reconnect
- Diagnostics

---

## STORY-0027-005

Runtime Configuration

Tasks

- Preferences
- Runtime selection
- Settings

---

## STORY-0027-006

UI

Tasks

- Runtime Manager
- Diagnostics
- Installed Models

---

# Complete Task Checklist

## Domain

- [ ] Runtime model
- [ ] Provider configuration
- [ ] Status model

## Application

- [ ] LocalProvider
- [ ] Discovery
- [ ] Synchronizer
- [ ] HealthService

## Infrastructure

- [ ] Ollama adapter
- [ ] LM Studio adapter
- [ ] llama.cpp adapter

## Renderer

- [ ] Runtime manager
- [ ] Health UI
- [ ] Diagnostics

## Validation

- [ ] Unit tests
- [ ] Integration tests
- [ ] Runtime compatibility tests

---

# Manual Verification

✓ Ollama detected

✓ LM Studio detected

✓ Models synchronized

✓ Runtime health updates

✓ Streaming works

✓ Auto reconnect succeeds

✓ Diagnostics available

---

# Automated Verification

```bash
pnpm --filter @ocs/provider-local test

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

The Local Provider Platform is complete when:

- Supported local runtimes are automatically discovered.
- Models synchronize with the Model Registry.
- Runtime health is continuously monitored.
- Streaming works consistently.
- Runtime failures recover automatically.
- All local runtimes conform to the Provider SDK.

---

# Risks

| Risk                    | Mitigation             |
| ----------------------- | ---------------------- |
| Runtime API changes     | Adapter layer          |
| Runtime crashes         | Auto reconnect         |
| Version incompatibility | Capability negotiation |
| Slow discovery          | Background scanning    |

---

# Future Enhancements

- Multi-runtime execution
- Distributed local clusters
- GPU affinity selection
- Runtime benchmarking
- Automatic runtime installation
- Local runtime marketplace

---

# Deliverables

- Local Provider Platform
- Runtime Discovery
- Model Synchronizer
- Health Monitoring
- Streaming Adapter
- Runtime Manager UI

---

# Traceability

Implements

- REQ-LOCAL-001 Local Runtime Support
- REQ-LOCAL-002 Runtime Discovery
- REQ-LOCAL-003 Model Synchronization
- REQ-LOCAL-004 Runtime Health

Related ADRs

- ADR-060 Local Provider Architecture
- ADR-061 Runtime Discovery

Related Events

- local.runtimeDetected
- local.runtimeConnected
- local.healthChanged

Related Commands

- local.scan
- local.connect
- local.models

---

# Epic Completion Summary

**Target Release:** **v0.3.0 Alpha**

The Local Provider Platform enables Open-Code.Studio to execute AI models entirely on the user's machine through a unified provider abstraction. It provides runtime discovery, health monitoring, model synchronization, and streaming while remaining fully compliant with the Provider SDK and Gateway architecture.

---

# Changelog

## v1.0.0 (Planned)

- Initial Local Provider Platform specification.
- Added LocalProvider, Runtime Discovery, Model Synchronizer, Health Service, runtime adapters, streaming support, commands, events, APIs, and diagnostics.
