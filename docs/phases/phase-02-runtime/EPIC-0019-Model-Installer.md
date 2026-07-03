# EPIC-0019 — Model Installer

| Property           | Value                                                |
| ------------------ | ---------------------------------------------------- |
| Epic ID            | EPIC-0019                                            |
| Phase              | Phase 2 – Runtime                                    |
| Status             | 📋 Planned                                           |
| Priority           | High                                                 |
| Estimated Duration | 2 Weeks                                              |
| Dependencies       | EPIC-0017 Model Registry, EPIC-0018 Model Downloader |
| Blocks             | EPIC-0020 GPU Detection, EPIC-0021 Memory Manager    |

---

# Overview

The Model Installer is responsible for taking downloaded AI model artifacts and preparing them for execution by the Runtime Platform.

Unlike the Downloader, the Installer understands model formats, verifies compatibility, prepares metadata, installs provider-specific assets, validates runtime requirements, and registers the model with the Model Registry.

The installer does **not** execute models.

---

# Vision

Create a provider-independent installation platform capable of installing models from any supported ecosystem while hiding provider-specific installation logic behind adapters.

Supported ecosystems include:

- Ollama
- LM Studio
- GGUF
- ONNX
- Hugging Face
- Safetensors
- TensorRT
- Enterprise Registries

---

# Objectives

## Functional

- Install downloaded models
- Verify compatibility
- Validate hardware requirements
- Register installed models
- Upgrade installed models
- Uninstall models
- Rollback failed installations
- Repair corrupted installations

## Non-Functional

- Transactional installs
- Recoverable failures
- Version aware
- Provider independent
- Event driven
- Extensible

---

# Scope

Included

- Installation Service
- Installer Adapters
- Verification
- Rollback
- Registry Integration
- Upgrade Support
- Uninstall Support

Excluded

- Downloads
- Runtime Execution
- Tokenization
- Context Management

---

# Architecture

```
Downloaded Artifact

↓

Installation Service

↓

Provider Installer

↓

Verification

↓

Registry Update

↓

Runtime Ready
```

---

# Package Structure

```
packages/model-installer/

domain/
    InstallationJob
    InstallationStatus
    InstalledModel
    InstallationManifest

application/
    InstallationService
    InstallationManager
    RollbackService
    VerificationService

providers/
    OllamaInstaller
    GGUFInstaller
    ONNXInstaller

infrastructure/
    InstallerStore

events/
    InstallationEvents

commands/
    InstallationCommands
```

---

# Core Components

## Installation Service

Responsibilities

- Install model
- Upgrade model
- Remove model
- Repair installation
- Publish events

Acts as the primary installation API.

---

## Installation Manager

Coordinates

- Verification
- Provider installation
- Rollback
- Registry update
- Cleanup

---

## Verification Service

Checks

- Checksums
- Manifest
- File integrity
- Provider compatibility
- Runtime compatibility
- Architecture compatibility

---

## Rollback Service

Automatically restores previous state when installation fails.

Rollback includes

- Partial files
- Registry
- Metadata
- Provider cleanup

---

# Installation Manifest

```yaml
modelId:
provider:
version:
format:
license:
checksum:
dependencies:
requirements:
```

---

# Installation Status

```
Pending

Installing

Verifying

Registering

Completed

Failed

RollingBack

RolledBack
```

---

# Installation Flow

```
Artifact

↓

Validation

↓

Compatibility Check

↓

Provider Install

↓

Verification

↓

Registry Update

↓

Runtime Available
```

---

# Renderer Components

```
InstallationManager

InstallationProgress

InstalledModels

InstallationLogs
```

---

# Commands

```
model.install

model.uninstall

model.upgrade

model.repair

model.verify
```

---

# Events

```
installation.started

installation.progress

installation.completed

installation.failed

installation.rollbackStarted

installation.rollbackCompleted
```

---

# APIs

## InstallationService

```typescript
install();

uninstall();

upgrade();

repair();

verify();

status();
```

---

# IPC Contracts

Renderer

```typescript
window.ocs.installer;

install();

upgrade();

remove();

repair();

status();
```

Main

```
installer:install

installer:upgrade

installer:remove

installer:repair
```

---

# Stories

## STORY-0019-001

Installation Domain

Tasks

- InstallationJob
- Manifest
- InstalledModel

---

## STORY-0019-002

Installation Service

Tasks

- Install
- Upgrade
- Remove

---

## STORY-0019-003

Verification

Tasks

- Integrity
- Compatibility
- Manifest validation

---

## STORY-0019-004

Rollback

Tasks

- Transaction rollback
- Cleanup
- Recovery

---

## STORY-0019-005

Registry Integration

Tasks

- Register installed model
- Update metadata
- Publish events

---

## STORY-0019-006

Installer UI

Tasks

- Progress
- Logs
- Installed models
- Repair

---

# Complete Task Checklist

## Domain

- [ ] InstallationJob
- [ ] Manifest
- [ ] InstalledModel

## Application

- [ ] InstallationService
- [ ] InstallationManager
- [ ] VerificationService
- [ ] RollbackService

## Infrastructure

- [ ] Provider installers
- [ ] Installer store

## Renderer

- [ ] Installation Manager
- [ ] Progress UI
- [ ] Logs

## Validation

- [ ] Unit tests
- [ ] Integration tests
- [ ] Upgrade tests
- [ ] Rollback tests

---

# Manual Verification

✓ Install model

✓ Registry updates

✓ Runtime detects model

✓ Upgrade model

✓ Remove model

✓ Repair installation

✓ Failed installation rolls back

---

# Automated Verification

```bash
pnpm --filter @ocs/model-installer test

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

The Model Installer is complete when:

- Downloaded artifacts install successfully.
- Failed installs automatically rollback.
- Installed models register with the Model Registry.
- Runtime immediately recognizes installed models.
- Provider-specific installers remain hidden behind adapters.

---

# Risks

| Risk                     | Mitigation             |
| ------------------------ | ---------------------- |
| Partial installs         | Transactional rollback |
| Provider incompatibility | Installer adapters     |
| Corrupted manifests      | Verification service   |
| Duplicate installations  | Registry validation    |

---

# Future Enhancements

- Incremental upgrades
- Delta installations
- Shared model storage
- Enterprise package repositories
- Offline installation bundles
- Containerized model deployment

---

# Deliverables

- Model Installer
- Installation Service
- Verification Service
- Rollback Service
- Provider Installers
- Installation Manager UI

---

# Traceability

Implements

- REQ-INSTALL-001 Model Installation
- REQ-INSTALL-002 Verification
- REQ-INSTALL-003 Rollback
- REQ-INSTALL-004 Registry Integration

Related ADRs

- ADR-041 Model Installation Architecture
- ADR-042 Transactional Install Pipeline

Related Events

- installation.started
- installation.completed
- installation.failed

Related Commands

- model.install
- model.uninstall
- model.upgrade

---

# Epic Completion Summary

**Target Release:** **v0.2.0 Alpha**

The Model Installer transforms downloaded artifacts into runtime-ready AI models through a transactional installation pipeline. By validating compatibility, supporting rollback, and integrating with the Model Registry, it ensures reliable model lifecycle management while remaining provider-independent.

---

# Changelog

## v1.0.0 (Planned)

- Initial Model Installer specification.
- Added InstallationService, Verification Service, Rollback Service, provider installers, installation pipeline, commands, events, APIs, and registry integration.
