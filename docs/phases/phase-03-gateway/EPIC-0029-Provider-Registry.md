# EPIC-0029 — Provider Registry

| Property           | Value                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Epic ID            | EPIC-0029                                                                                          |
| Phase              | Phase 3 – Gateway                                                                                  |
| Status             | 📋 Planned                                                                                         |
| Priority           | Critical                                                                                           |
| Estimated Duration | 2 Weeks                                                                                            |
| Dependencies       | EPIC-0025 Gateway Core, EPIC-0026 Provider SDK, EPIC-0027 Local Provider, EPIC-0028 Cloud Provider |
| Blocks             | EPIC-0030 Provider Policy Engine, EPIC-0031 Cost Tracking, Phase 6 Agent Platform                  |

---

# Overview

The Provider Registry is the single source of truth for every AI provider available within Open-Code.Studio.

Rather than allowing Runtime or Gateway to discover providers independently, every provider registers itself with the Provider Registry.

The registry maintains:

- Installed providers
- Active providers
- Health
- Capabilities
- Models
- Authentication status
- Cost metadata
- Latency
- Regions
- SDK compatibility

The Provider Registry is the "Service Registry" of the AI platform.

---

# Vision

Create a centralized provider catalog capable of managing:

- Local providers
- Cloud providers
- Enterprise providers
- Extension providers
- Future community providers

without modifying Runtime or Gateway.

---

# Objectives

## Functional

- Provider registration
- Provider discovery
- Health tracking
- Capability indexing
- Model indexing
- Provider search
- SDK compatibility
- Dynamic loading
- Dynamic unloading
- Runtime provider selection support

## Non-Functional

- Event driven
- Cached
- Extensible
- Thread safe
- Provider independent
- Observable

---

# Scope

Included

- Provider Registry
- Registration
- Discovery
- Capability Index
- Health Index
- Model Index
- Dynamic Loading

Excluded

- Provider execution
- Cost optimization
- Authentication
- Routing policies

---

# Architecture

```
Provider SDK

↓

Provider Registry

↓

Gateway

↓

Runtime

↓

Agents
```

Every provider becomes discoverable through the registry.

---

# Package Structure

```
packages/provider-registry/

domain/
    ProviderDescriptor
    ProviderStatus
    ProviderCapability
    ProviderHealth

application/
    ProviderRegistry
    ProviderDiscovery
    ProviderIndexer
    ProviderValidator

storage/
    RegistryStore

events/
    ProviderRegistryEvents

commands/
    ProviderRegistryCommands
```

---

# Core Components

## Provider Registry

Responsibilities

- Register providers
- Remove providers
- Update providers
- Discover providers
- Publish events

Acts as the authoritative provider catalog.

---

## Provider Discovery

Discovers

- Local Providers
- Cloud Providers
- Enterprise Providers
- Extension Providers

Automatically registers them.

---

## Provider Indexer

Indexes

- Models
- Capabilities
- Regions
- Cost
- Latency
- SDK Version

Enables fast lookup.

---

## Provider Validator

Validates

- SDK compatibility
- Required interfaces
- Version support
- Health

Rejects incompatible providers.

---

# Provider Descriptor

```typescript
id;

name;

version;

vendor;

type;

sdkVersion;

capabilities;

models;

health;

authentication;

status;

metadata;
```

---

# Provider Types

```
Local

Cloud

Enterprise

Extension

Custom
```

---

# Provider Status

```
Loading

Available

Busy

Updating

Unavailable

Disabled

Deprecated
```

---

# Registry Features

Supports

- Dynamic loading
- Dynamic unloading
- Provider refresh
- Background health polling
- Fast lookup
- Capability search

---

# Search Features

Search by

- Name
- Vendor
- Capability
- Region
- Model
- Type
- Status
- SDK Version

---

# Renderer Components

```
ProviderRegistryView

ProviderBrowser

CapabilityExplorer

HealthDashboard

ProviderDetails
```

---

# Commands

```
providers.list

providers.refresh

providers.enable

providers.disable

providers.validate

providers.details
```

---

# Events

```
provider.registered

provider.updated

provider.removed

provider.enabled

provider.disabled

provider.healthChanged

provider.discovered
```

---

# APIs

## ProviderRegistry

```typescript
register();

remove();

refresh();

providers();

models();

capabilities();

health();

search();
```

---

# IPC Contracts

Renderer

```typescript
window.ocs.providers;

list();

details();

refresh();

health();

search();
```

Main

```
providers:list

providers:refresh

providers:health

providers:details
```

---

# Stories

## STORY-0029-001

Registry Domain

Tasks

- Provider descriptor
- Status model
- Capability model

---

## STORY-0029-002

Provider Registry

Tasks

- Register
- Remove
- Refresh
- Lookup

---

## STORY-0029-003

Discovery

Tasks

- Dynamic discovery
- Auto registration
- Validation

---

## STORY-0029-004

Indexer

Tasks

- Capability index
- Model index
- Vendor index

---

## STORY-0029-005

Health

Tasks

- Health polling
- Provider state
- Diagnostics

---

## STORY-0029-006

Registry UI

Tasks

- Browser
- Details
- Health
- Search

---

# Complete Task Checklist

## Domain

- [ ] ProviderDescriptor
- [ ] ProviderStatus
- [ ] Capability model
- [ ] Health model

## Application

- [ ] ProviderRegistry
- [ ] Discovery
- [ ] Indexer
- [ ] Validator

## Infrastructure

- [ ] RegistryStore
- [ ] Health polling

## Renderer

- [ ] Provider Browser
- [ ] Details View
- [ ] Health Dashboard

## Validation

- [ ] Unit tests
- [ ] Integration tests
- [ ] SDK compatibility tests

---

# Manual Verification

✓ Provider registers

✓ Provider removed

✓ Health updates

✓ Models indexed

✓ Capabilities indexed

✓ Search works

✓ Registry refresh works

---

# Automated Verification

```bash
pnpm --filter @ocs/provider-registry test

pnpm validate

pnpm lint

pnpm typecheck
```

Coverage Target

```
>=90%
```

Performance Targets

| Metric                | Target     |
| --------------------- | ---------- |
| Registry Lookup       | <5 ms      |
| Provider Registration | <20 ms     |
| Capability Search     | <10 ms     |
| Health Refresh        | Background |

---

# Acceptance Criteria

The Provider Registry is complete when:

- Every provider registers automatically.
- Gateway and Runtime query only the registry.
- Provider capabilities are searchable.
- Health is continuously updated.
- SDK compatibility is enforced.
- Dynamic loading and unloading work without restarting Open-Code.Studio.

---

# Risks

| Risk                    | Mitigation            |
| ----------------------- | --------------------- |
| Duplicate registrations | Unique provider IDs   |
| Registry corruption     | Persistent validation |
| Slow discovery          | Background indexing   |
| SDK incompatibility     | Validator             |

---

# Future Enhancements

- Enterprise provider catalogs
- Community providers
- Provider ratings
- Provider benchmarking
- Provider marketplace
- Remote provider discovery
- Cluster-aware providers

---

# Deliverables

- Provider Registry
- Discovery Service
- Provider Indexer
- Registry Validator
- Health Dashboard
- Search API

---

# Traceability

Implements

- REQ-REG-001 Provider Registry
- REQ-REG-002 Provider Discovery
- REQ-REG-003 Provider Health
- REQ-REG-004 Provider Search

Related ADRs

- ADR-065 Provider Registry Architecture
- ADR-066 Provider Discovery

Related Events

- provider.registered
- provider.updated
- provider.healthChanged

Related Commands

- providers.list
- providers.refresh
- providers.details

---

# Epic Completion Summary

**Target Release:** **v0.3.0 Alpha**

The Provider Registry establishes the authoritative catalog of AI providers within Open-Code.Studio. By centralizing provider discovery, capabilities, health, and metadata, it decouples Runtime and Gateway from provider implementations while enabling scalable support for local, cloud, enterprise, and future extension-based providers.

---

# Changelog

## v1.0.0 (Planned)

- Initial Provider Registry specification.
- Added ProviderRegistry, Discovery Service, Provider Indexer, Validator, Registry Store, health monitoring, commands, events, APIs, and dynamic provider lifecycle support.
