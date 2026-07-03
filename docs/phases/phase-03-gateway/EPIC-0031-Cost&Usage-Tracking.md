# EPIC-0031 — Cost & Usage Tracking

| Property           | Value                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------- |
| Epic ID            | EPIC-0031                                                                             |
| Phase              | Phase 3 – Gateway                                                                     |
| Status             | 📋 Planned                                                                            |
| Priority           | High                                                                                  |
| Estimated Duration | 2 Weeks                                                                               |
| Dependencies       | EPIC-0025 Gateway Core, EPIC-0029 Provider Registry, EPIC-0030 Provider Policy Engine |
| Blocks             | Enterprise Billing, Usage Analytics, Organization Management                          |

---

# Overview

The Cost & Usage Tracking Platform provides real-time accounting of AI usage across all providers.

Every request executed through the Gateway generates usage records including:

- Input tokens
- Output tokens
- Latency
- Estimated cost
- Actual cost
- Provider
- Model
- User
- Workspace
- Agent
- Workflow

The platform provides accurate cost visibility for individuals, teams, and enterprises while remaining provider-independent.

---

# Vision

Create a unified accounting system that tracks AI consumption regardless of provider.

Supported usage types

- Chat
- Code Generation
- Embeddings
- Vision
- Speech
- Agents
- Workflows
- Extensions

---

# Objectives

## Functional

- Token accounting
- Cost calculation
- Provider pricing
- Budget tracking
- Daily usage
- Monthly usage
- Workspace usage
- User usage
- Export reports
- Cost forecasting

## Non-Functional

- Accurate
- Provider independent
- Event driven
- Low overhead
- Historical
- Auditable

---

# Scope

Included

- Usage Tracking
- Cost Calculator
- Pricing Registry
- Usage Reports
- Budget Engine
- Forecasting

Excluded

- Billing
- Invoicing
- Payments
- Licensing

---

# Architecture

```
Runtime

↓

Gateway

↓

Usage Collector

↓

Cost Calculator

↓

Usage Store

↓

Reports
```

---

# Package Structure

```
packages/cost/

domain/
    UsageRecord
    CostRecord
    ProviderPricing
    Budget

application/
    UsageTracker
    CostCalculator
    BudgetManager
    ForecastService

storage/
    UsageStore
    PricingStore

events/
    CostEvents

commands/
    CostCommands
```

---

# Core Components

## Usage Tracker

Responsibilities

- Record every request
- Aggregate usage
- Publish events

---

## Cost Calculator

Calculates

- Input cost
- Output cost
- Request cost
- Session cost
- Daily totals

Supports provider-specific pricing.

---

## Pricing Registry

Stores

- Provider pricing
- Model pricing
- Regional pricing
- Version history

Supports automatic pricing updates.

---

## Budget Manager

Supports

- Daily budgets
- Monthly budgets
- Workspace budgets
- Organization budgets

Can trigger warnings before limits are exceeded.

---

## Forecast Service

Predicts

- Daily spend
- Monthly spend
- Annual projections
- Budget exhaustion

---

# Usage Record

```typescript
id;

timestamp;

provider;

model;

workspace;

user;

agent;

workflow;

inputTokens;

outputTokens;

latency;

estimatedCost;

actualCost;
```

---

# Cost Metrics

Tracks

- Total Requests
- Input Tokens
- Output Tokens
- Total Tokens
- Provider Spend
- Model Spend
- Cost Per User
- Cost Per Workspace
- Average Cost
- Peak Usage

---

# Budget Levels

```
Global

↓

Organization

↓

Workspace

↓

User
```

---

# Renderer Components

```
UsageDashboard

CostExplorer

BudgetManager

ForecastView

ProviderCostChart

ModelUsageChart
```

---

# Commands

```
cost.summary

cost.history

cost.forecast

cost.export

budget.create

budget.update
```

---

# Events

```
usage.recorded

cost.calculated

budget.warning

budget.exceeded

pricing.updated
```

---

# APIs

## UsageTracker

```typescript
record()

summary()

history()

forecast()

pricing()

budgets()

export()
```

---

# IPC Contracts

Renderer

```typescript
window.ocs.cost;

summary();

history();

forecast();

budgets();

pricing();
```

Main

```
cost:summary

cost:history

cost:forecast

cost:pricing
```

---

# Stories

## STORY-0031-001

Usage Tracking

Tasks

- Usage record
- Token tracking
- Latency tracking

---

## STORY-0031-002

Cost Calculation

Tasks

- Pricing engine
- Request cost
- Session cost

---

## STORY-0031-003

Budget Manager

Tasks

- Budgets
- Alerts
- Thresholds

---

## STORY-0031-004

Forecasting

Tasks

- Predictions
- Reports
- Trends

---

## STORY-0031-005

Pricing Registry

Tasks

- Provider pricing
- Model pricing
- Updates

---

## STORY-0031-006

Dashboard

Tasks

- Charts
- Reports
- Export

---

# Complete Task Checklist

## Domain

- [ ] UsageRecord
- [ ] CostRecord
- [ ] Budget
- [ ] Pricing

## Application

- [ ] UsageTracker
- [ ] CostCalculator
- [ ] BudgetManager
- [ ] ForecastService

## Infrastructure

- [ ] UsageStore
- [ ] PricingStore

## Renderer

- [ ] Dashboard
- [ ] Forecast
- [ ] Reports

## Validation

- [ ] Unit tests
- [ ] Integration tests
- [ ] Pricing validation
- [ ] Forecast accuracy tests

---

# Manual Verification

✓ Usage recorded

✓ Cost calculated correctly

✓ Budgets enforced

✓ Forecast generated

✓ Reports exported

✓ Pricing updates applied

---

# Automated Verification

```bash
pnpm --filter @ocs/cost test

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

The Cost & Usage Tracking Platform is complete when:

- Every Gateway request produces a usage record.
- Costs are calculated accurately.
- Budgets generate warnings.
- Usage reports are exportable.
- Forecasts estimate future spend.
- Provider pricing updates without code changes.

---

# Risks

| Risk                     | Mitigation                     |
| ------------------------ | ------------------------------ |
| Provider pricing changes | Pricing Registry               |
| Missing usage records    | Event-driven tracking          |
| Large history            | Aggregation & archival         |
| Budget bypass            | Centralized Gateway accounting |

---

# Future Enhancements

- Real billing integration
- Department chargeback
- Cost optimization recommendations
- AI spend analytics
- Carbon footprint estimation
- Enterprise budgeting
- Cost anomaly detection

---

# Deliverables

- Usage Tracker
- Cost Calculator
- Budget Manager
- Pricing Registry
- Forecast Service
- Usage Dashboard

---

# Traceability

Implements

- REQ-COST-001 Usage Tracking
- REQ-COST-002 Cost Calculation
- REQ-COST-003 Budget Management
- REQ-COST-004 Forecasting

Related ADRs

- ADR-070 Cost Tracking Architecture
- ADR-071 Pricing Registry

Related Events

- usage.recorded
- cost.calculated
- budget.warning

Related Commands

- cost.summary
- cost.history
- budget.create

---

# Epic Completion Summary

**Target Release:** **v0.3.0 Alpha**

The Cost & Usage Tracking Platform provides a centralized accounting system for all AI activity within Open-Code.Studio. By tracking tokens, latency, pricing, and budgets across providers, it enables cost transparency, forecasting, and governance while preparing the platform for enterprise billing and analytics.

---

# Changelog

## v1.0.0 (Planned)

- Initial Cost & Usage Tracking specification.
- Added Usage Tracker, Cost Calculator, Pricing Registry, Budget Manager, Forecast Service, commands, events, APIs, dashboards, and reporting.
