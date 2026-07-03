# EPIC-0025 — Gateway Core

| Property           | Value                                                                      |
| ------------------ | -------------------------------------------------------------------------- |
| Epic ID            | EPIC-0025                                                                  |
| Phase              | Phase 3 – Gateway                                                          |
| Status             | 📋 Planned                                                                 |
| Priority           | Critical                                                                   |
| Estimated Duration | 3 Weeks                                                                    |
| Dependencies       | Phase 2 Runtime Complete                                                   |
| Blocks             | EPIC-0026 Provider SDK, EPIC-0027 Local Provider, EPIC-0028 Cloud Provider |

---

# Overview

The Gateway Core provides a unified communication layer between the Runtime Platform and AI providers.

Rather than allowing Runtime to directly invoke providers, every request flows through the Gateway.

The Gateway is responsible for:

- Provider routing
- Authentication
- Request transformation
- Response normalization
- Streaming
- Retry
- Failover
- Rate limiting
- Cost tracking hooks
- Provider capability negotiation

It is conceptually similar to an API Gateway in cloud-native architectures.

---

# Vision

Create a provider-independent AI Gateway capable of routing requests to:

- Ollama
- LM Studio
- OpenAI
- Anthropic
- Gemini
- Azure OpenAI
- HuggingFace
- NVIDIA NIM
- Enterprise Providers
- Future Providers

without modifying Runtime.

---

# Objectives

## Functional

- Provider routing
- Request normalization
- Response normalization
- Authentication
- Streaming proxy
- Retry
- Timeout handling
- Failover
- Capability negotiation
- Middleware pipeline

## Non-Functional

- Provider independent
- Event driven
- Extensible
- High throughput
- Observable
- Secure

---

# Scope

Included

- Gateway Core
- Request Pipeline
- Response Pipeline
- Middleware
- Provider Router
- Streaming
- Authentication hooks

Excluded

- Provider implementations
- Cost tracking
- Model registry
- Runtime execution

---

# Architecture

```
Runtime Service

↓

Gateway Core

↓

Middleware Pipeline

↓

Provider Router

↓

Provider Adapter

↓

AI Provider
```

Gateway owns every outbound AI request.

---

# Package Structure

```
packages/gateway/

domain/
    GatewayRequest
    GatewayResponse
    ProviderRoute
    GatewayError

application/
    GatewayService
    RequestPipeline
    ResponsePipeline
    ProviderRouter

middleware/
    AuthenticationMiddleware
    RetryMiddleware
    LoggingMiddleware
    MetricsMiddleware

events/
    GatewayEvents

commands/
    GatewayCommands
```

---

# Core Components

## Gateway Service

Responsibilities

- Receive requests
- Execute middleware
- Route providers
- Normalize responses
- Publish events

Acts as the public Gateway API.

---

## Provider Router

Chooses provider using

- Model
- Capability
- User preference
- Runtime policy
- Provider health
- Cost policy

Future

AI-assisted routing.

---

## Request Pipeline

Stages

```
Validation

↓

Authentication

↓

Transformation

↓

Routing

↓

Provider

↓

Streaming

↓

Response
```

---

## Middleware

Supports

- Authentication
- Retry
- Timeout
- Metrics
- Logging
- Tracing
- Compression

Future

Extension middleware.

---

## Response Pipeline

Responsibilities

- Normalize responses
- Normalize errors
- Normalize usage
- Publish metrics

---

# Gateway Request

```typescript
id;

provider;

model;

capabilities;

payload;

metadata;

stream;

priority;
```

---

# Gateway Response

```typescript
id;

provider;

status;

completion;

usage;

latency;

metadata;
```

---

# Gateway States

```
Received

Validated

Authenticated

Routing

Executing

Streaming

Completed

Failed
```

---

# Streaming

Supports

- SSE
- WebSocket
- Chunked HTTP
- Local streaming

Unified streaming API regardless of provider.

---

# Renderer Components

```
GatewayStatus

ProviderRouteView

StreamingMonitor

GatewayDiagnostics
```

---

# Commands

```
gateway.execute

gateway.retry

gateway.reload

gateway.health

gateway.providers

gateway.routes
```

---

# Events

```
gateway.requestReceived

gateway.requestRouted

gateway.streamingStarted

gateway.completed

gateway.failed

gateway.providerChanged
```

---

# APIs

## GatewayService

```typescript
execute();

stream();

providers();

health();

routes();

reload();
```

---

# IPC Contracts

Renderer

```typescript
window.ocs.gateway;

execute();

providers();

health();

routes();
```

Main

```
gateway:execute

gateway:providers

gateway:health

gateway:routes
```

---

# Stories

## STORY-0025-001

Gateway Domain

Tasks

- Request model
- Response model
- Error model
- Route model

---

## STORY-0025-002

Gateway Service

Tasks

- Execute
- Route
- Stream
- Retry

---

## STORY-0025-003

Provider Router

Tasks

- Routing rules
- Capability matching
- Health-aware routing

---

## STORY-0025-004

Middleware

Tasks

- Authentication
- Logging
- Retry
- Metrics

---

## STORY-0025-005

Streaming

Tasks

- SSE
- WebSocket
- Local streaming
- Response normalization

---

## STORY-0025-006

Gateway UI

Tasks

- Diagnostics
- Route viewer
- Health panel

---

# Complete Task Checklist

## Domain

- [ ] GatewayRequest
- [ ] GatewayResponse
- [ ] ProviderRoute
- [ ] GatewayError

## Application

- [ ] GatewayService
- [ ] ProviderRouter
- [ ] RequestPipeline
- [ ] ResponsePipeline

## Middleware

- [ ] Authentication
- [ ] Retry
- [ ] Metrics
- [ ] Logging

## Renderer

- [ ] Gateway Dashboard
- [ ] Route Viewer
- [ ] Diagnostics

## Validation

- [ ] Unit tests
- [ ] Integration tests
- [ ] Streaming tests
- [ ] Multi-provider tests

---

# Manual Verification

✓ Execute request

✓ Provider selected

✓ Streaming works

✓ Retry works

✓ Middleware executes

✓ Response normalized

✓ Health displayed

---

# Automated Verification

```bash
pnpm --filter @ocs/gateway test

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

The Gateway Core is complete when:

- All Runtime requests pass through Gateway.
- Providers are selected through routing policies.
- Responses are normalized.
- Streaming is provider-independent.
- Middleware is extensible.
- Runtime has no provider-specific logic.

---

# Risks

| Risk                        | Mitigation                  |
| --------------------------- | --------------------------- |
| Provider API differences    | Normalization layer         |
| Authentication complexity   | Middleware architecture     |
| Streaming incompatibilities | Unified streaming interface |
| Vendor lock-in              | Provider abstraction        |

---

# Future Enhancements

- Multi-provider fan-out
- Request mirroring
- AI load balancing
- Canary routing
- Enterprise API Gateway
- Gateway plugins
- Distributed Gateway clusters

---

# Deliverables

- Gateway Core
- Gateway Service
- Provider Router
- Middleware Pipeline
- Streaming Proxy
- Diagnostics Dashboard

---

# Traceability

Implements

- REQ-GW-001 Provider Routing
- REQ-GW-002 Request Pipeline
- REQ-GW-003 Streaming
- REQ-GW-004 Response Normalization

Related ADRs

- ADR-054 Gateway Architecture
- ADR-055 Provider Routing
- ADR-056 Middleware Pipeline

Related Events

- gateway.requestReceived
- gateway.requestRouted
- gateway.completed

Related Commands

- gateway.execute
- gateway.providers
- gateway.health

---

# Epic Completion Summary

**Target Release:** **v0.3.0 Alpha**

The Gateway Core establishes the provider-independent networking layer of Open-Code.Studio. By routing all Runtime requests through a unified middleware and routing pipeline, it decouples AI execution from provider implementations while enabling authentication, streaming, failover, observability, and future enterprise gateway capabilities.
