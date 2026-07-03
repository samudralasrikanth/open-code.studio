# EPIC-0017 — Model Registry

| Property           | Value                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Epic ID            | EPIC-0017                                                                                         |
| Phase              | Phase 2 – Runtime                                                                                 |
| Status             | 📋 Planned                                                                                        |
| Priority           | Critical                                                                                          |
| Estimated Duration | 2–3 Weeks                                                                                         |
| Dependencies       | EPIC-0016 Runtime Service                                                                         |
| Blocks             | EPIC-0018 Model Downloader, EPIC-0019 Model Installer, EPIC-0022 Context Manager, Phase 3 Gateway |

---

# Overview

The Model Registry is the authoritative catalog of every AI model known to Open-Code.Studio. It tracks installed models, downloadable models, cloud models, capabilities, providers, hardware requirements, licensing, quantization variants, embeddings, and runtime compatibility.

Rather than letting every provider expose its own model list, all models are normalized into a common registry.

Every component—including Runtime, Gateway, Agents, AI Chat, Workflow Engine, Extensions, and Knowledge Engine—queries the Model Registry instead of individual providers.

---

# Vision

Create a provider-independent registry capable of managing models from:

- Ollama
- LM Studio
- OpenAI
- Anthropic
- Google Gemini
- Azure OpenAI
- Hugging Face
- NVIDIA NIM
- Future providers

through one unified interface.

---

# Objectives

## Functional

- Discover installed models
- Register cloud models
- Provider normalization
- Capability discovery
- Version tracking
- Quantization tracking
- Model metadata
- Model search
- Compatibility validation
- Provider synchronization

## Non-Functional

- Provider independent
- Event driven
- Extensible
- Cached
- Fast lookup
- Offline capable

---

# Scope

Included

- Model Registry
- Registry Service
- Model Discovery
- Capability Registry
- Metadata Cache
- Search
- Provider Synchronization

Excluded

- Model downloads
- Model installation
- Runtime execution
- Token counting

---

# Architecture

```
Providers

↓

Provider Adapter

↓

Model Registry

↓

Metadata Cache

↓

Runtime / Gateway / Agents / UI
```

The registry becomes the single source of truth.

---

# Package Structure

```
packages/model-registry/

domain/
    AIModel
    ModelCapability
    ModelProvider
    ModelVariant
    ModelLicense

application/
    ModelRegistry
    RegistrySynchronizer
    CapabilityService
    MetadataCache

providers/
    OllamaDiscovery
    OpenAIDiscovery
    GeminiDiscovery

events/
    ModelRegistryEvents

commands/
    ModelRegistryCommands
```

---

# Core Components

## Model Registry

Responsibilities

- Register models
- Remove models
- Update metadata
- Search models
- Query capabilities
- Publish events

Acts as the primary model catalog.

---

## Registry Synchronizer

Synchronizes

- Installed models
- Cloud providers
- Provider metadata
- Version changes

Runs automatically in the background.

---

## Metadata Cache

Stores

- Context length
- Parameter count
- Quantization
- File size
- Memory requirements
- Tokenizer
- License
- Supported modalities

---

## Capability Service

Tracks

```
Chat

Completion

Embedding

Vision

Image Generation

Speech

Function Calling

JSON Mode

Tool Calling

Streaming
```

Future capabilities can be added without changing consumers.

---

# AI Model

```typescript
id;

provider;

name;

family;

version;

size;

quantization;

license;

installed;

downloaded;

capabilities;

requirements;

metadata;
```

---

# Provider Model

```
Ollama

LM Studio

OpenAI

Anthropic

Gemini

Azure

Custom
```

---

# Model Status

```
Discovered

Available

Downloading

Installing

Installed

Updating

Deprecated

Unavailable
```

---

# Search Features

Supports

- Name
- Family
- Capability
- Provider
- Installed only
- Cloud only
- Context length
- Size
- Quantization

---

# Renderer Components

```
ModelManager

ModelBrowser

ModelDetails

CapabilityView

ProviderSelector

InstalledModelsView
```

---

# Commands

```
model.refresh

model.search

model.details

model.install

model.remove

model.validate

model.sync
```

---

# Events

```
model.discovered

model.registered

model.updated

model.removed

model.installed

model.uninstalled

model.providerSynced
```

---

# APIs

## ModelRegistry

```typescript
register();

remove();

find();

search();

installed();

providers();

capabilities();

refresh();

sync();
```

---

# IPC Contracts

Renderer

```typescript
window.ocs.models;

list();

search();

details();

installed();

providers();

refresh();
```

Main

```
models:list

models:search

models:details

models:refresh

models:providers
```

---

# Stories

## STORY-0017-001

Registry Domain

Tasks

- AIModel
- Provider model
- Capability model
- Metadata model

---

## STORY-0017-002

Registry Service

Tasks

- Register
- Remove
- Search
- Lookup

---

## STORY-0017-003

Discovery

Tasks

- Provider scanning
- Metadata loading
- Synchronization

---

## STORY-0017-004

Capabilities

Tasks

- Capability registry
- Filtering
- Validation

---

## STORY-0017-005

Metadata Cache

Tasks

- Cache
- Refresh
- Expiration

---

## STORY-0017-006

UI

Tasks

- Model browser
- Details
- Search
- Provider filter

---

## STORY-0017-007

Provider Integration

Tasks

- Provider adapters
- Synchronization
- Health validation

---

# Complete Task Checklist

## Domain

- [ ] AIModel
- [ ] Provider
- [ ] Capability
- [ ] Metadata

## Application

- [ ] ModelRegistry
- [ ] Synchronizer
- [ ] CapabilityService
- [ ] Cache

## Infrastructure

- [ ] Provider adapters
- [ ] Metadata loader

## Renderer

- [ ] Model browser
- [ ] Search
- [ ] Details
- [ ] Provider selector

## Validation

- [ ] Unit tests
- [ ] Integration tests
- [ ] Provider compatibility tests

---

# Manual Verification

✓ Installed models discovered

✓ Cloud models listed

✓ Search works

✓ Provider filter works

✓ Metadata displayed

✓ Registry updates after provider refresh

✓ Capabilities correctly detected

---

# Automated Verification

```bash
pnpm --filter @ocs/model-registry test

pnpm validate

pnpm lint

pnpm typecheck
```

Coverage Target

```
>=90%
```

Performance Targets

| Metric             | Target     |
| ------------------ | ---------- |
| Registry Load      | <200 ms    |
| Search             | <20 ms     |
| Provider Sync      | Background |
| Metadata Cache Hit | >95%       |

---

# Acceptance Criteria

The Model Registry is complete when:

- All providers expose models through a common registry.
- Model metadata is normalized.
- Capabilities are searchable.
- Registry updates automatically after provider changes.
- Consumers never communicate directly with providers.
- New providers can register models without modifying existing code.

---

# Risks

| Risk                            | Mitigation                 |
| ------------------------------- | -------------------------- |
| Provider metadata inconsistency | Normalization layer        |
| Duplicate models                | Canonical IDs              |
| Slow provider scans             | Background synchronization |
| Metadata drift                  | Version tracking           |

---

# Future Enhancements

- Model ratings
- Community models
- Benchmark scores
- Hardware recommendations
- Automatic compatibility checks
- Marketplace integration
- Organization-approved model catalogs

---

# Deliverables

- Model Registry
- Registry Service
- Provider Synchronizer
- Capability Registry
- Metadata Cache
- Model Browser
- Search API

---

# Traceability

Implements

- REQ-MODEL-001 Model Registry
- REQ-MODEL-002 Capability Discovery
- REQ-MODEL-003 Provider Synchronization
- REQ-MODEL-004 Model Search

Related ADRs

- ADR-037 Model Registry Architecture
- ADR-038 Provider Metadata Normalization

Related Events

- model.registered
- model.updated
- model.providerSynced

Related Commands

- model.search
- model.refresh
- model.details

---

# Epic Completion Summary

**Target Release:** **v0.2.0 Alpha**

The Model Registry establishes the authoritative catalog of AI models within Open-Code.Studio. By normalizing models from multiple providers into a unified registry, it enables consistent discovery, capability filtering, metadata management, and future interoperability across Runtime, Gateway, Agents, Extensions, and Enterprise deployments.

---

# Changelog

## v1.0.0 (Planned)

- Initial Model Registry specification.
- Added ModelRegistry, Registry Synchronizer, Capability Service, Metadata Cache, provider normalization, commands, events, APIs, and UI management.
