# EPIC-0018 — Model Downloader

| Property           | Value                                               |
| ------------------ | --------------------------------------------------- |
| Epic ID            | EPIC-0018                                           |
| Phase              | Phase 2 – Runtime                                   |
| Status             | 📋 Planned                                          |
| Priority           | High                                                |
| Estimated Duration | 2 Weeks                                             |
| Dependencies       | EPIC-0016 Runtime Service, EPIC-0017 Model Registry |
| Blocks             | EPIC-0019 Model Installer                           |

---

# Overview

The Model Downloader is responsible for downloading AI models from remote registries and providers. It provides resumable downloads, integrity verification, progress reporting, bandwidth throttling, caching, and download scheduling.

The Downloader never installs models directly. It only retrieves verified artifacts and hands them off to the Model Installer.

Supported sources include:

- Ollama Registry
- Hugging Face
- OpenAI Cached Assets
- Anthropic Assets
- LM Studio
- NVIDIA NIM
- Enterprise Registries
- Custom Registries

---

# Vision

Provide a production-grade download manager capable of handling multi-gigabyte AI models reliably while supporting future enterprise and air-gapped deployments.

---

# Objectives

## Functional

- Download AI models
- Pause downloads
- Resume downloads
- Cancel downloads
- Retry failed downloads
- Verify checksums
- Concurrent downloads
- Download queue
- Download history
- Progress reporting

## Non-Functional

- Resume after restart
- Background downloads
- Low memory usage
- Download integrity
- Event driven
- Extensible

---

# Scope

Included

- Download Service
- Download Queue
- Checksum Validation
- Resume Support
- Provider Download Adapters
- Download Progress
- Cache Management

Excluded

- Model Installation
- Model Execution
- Model Registration
- Runtime Loading

---

# Architecture

```
Model Registry

↓

Download Service

↓

Download Scheduler

↓

Provider Adapter

↓

Remote Registry

↓

Download Cache

↓

Model Installer
```

---

# Package Structure

```
packages/model-downloader/

domain/
    DownloadJob
    DownloadStatus
    DownloadSource
    DownloadArtifact

application/
    DownloadService
    DownloadScheduler
    DownloadQueue
    DownloadHistory

providers/
    OllamaDownloader
    HuggingFaceDownloader
    CustomDownloader

infrastructure/
    DownloadCache
    ChecksumValidator

events/
    DownloadEvents

commands/
    DownloadCommands
```

---

# Core Components

## Download Service

Responsibilities

- Create download jobs
- Pause downloads
- Resume downloads
- Retry failures
- Report progress
- Validate integrity

Acts as the primary download API.

---

## Download Scheduler

Responsibilities

- Queue downloads
- Prioritize downloads
- Control concurrency
- Retry failed downloads

---

## Download Cache

Stores

- Partial downloads
- Completed downloads
- Metadata
- Resume checkpoints

Supports interrupted downloads.

---

## Checksum Validator

Supports

- SHA256
- SHA512
- MD5 (legacy)

Ensures downloaded artifacts are valid before installation.

---

# Download Job

```typescript
id;

modelId;

provider;

url;

size;

downloaded;

status;

checksum;

priority;

createdAt;
```

---

# Download Status

```
Queued

Downloading

Paused

Completed

Cancelled

Failed

Verifying
```

---

# Download Features

Supports

- Resume
- Retry
- Parallel downloads
- Download limits
- Bandwidth throttling
- Background downloads

---

# Renderer Components

```
DownloadManager

DownloadQueueView

DownloadProgress

DownloadHistory

DownloadDetails
```

---

# Commands

```
download.start

download.pause

download.resume

download.cancel

download.retry

download.clearCompleted
```

---

# Events

```
download.started

download.progress

download.paused

download.completed

download.failed

download.cancelled

download.verified
```

---

# APIs

## DownloadService

```typescript
start();

pause();

resume();

cancel();

retry();

history();

active();

queue();
```

---

# IPC Contracts

Renderer

```typescript
window.ocs.downloads;

start();

pause();

resume();

cancel();

queue();

history();
```

Main

```
downloads:start

downloads:pause

downloads:resume

downloads:cancel

downloads:history
```

---

# Stories

## STORY-0018-001

Download Domain

Tasks

- DownloadJob
- Status model
- Artifact model

---

## STORY-0018-002

Download Service

Tasks

- Start
- Pause
- Resume
- Cancel

---

## STORY-0018-003

Scheduler

Tasks

- Queue
- Retry
- Priority
- Concurrency

---

## STORY-0018-004

Checksum Validation

Tasks

- SHA256
- Verification
- Integrity failures

---

## STORY-0018-005

Provider Adapters

Tasks

- Ollama
- Hugging Face
- Custom registries

---

## STORY-0018-006

Download UI

Tasks

- Queue
- Progress
- History
- Details

---

# Complete Task Checklist

## Domain

- [ ] DownloadJob
- [ ] Artifact
- [ ] Status

## Application

- [ ] DownloadService
- [ ] Scheduler
- [ ] Queue
- [ ] History

## Infrastructure

- [ ] Cache
- [ ] Checksum validator
- [ ] Resume support

## Renderer

- [ ] Download manager
- [ ] Progress UI
- [ ] History

## Validation

- [ ] Unit tests
- [ ] Integration tests
- [ ] Large file download tests

---

# Manual Verification

✓ Download model

✓ Pause download

✓ Resume download

✓ Cancel download

✓ Retry failed download

✓ Restart IDE

✓ Resume continues correctly

✓ Checksum verified

---

# Automated Verification

```bash
pnpm --filter @ocs/model-downloader test

pnpm validate

pnpm lint

pnpm typecheck
```

Coverage Target

```
>=90%
```

Performance Targets

| Metric               | Target    |
| -------------------- | --------- |
| Resume Accuracy      | 100%      |
| Download Recovery    | Automatic |
| Concurrent Downloads | 5+        |
| Checksum Validation  | 100%      |

---

# Acceptance Criteria

The Model Downloader is complete when:

- Large model downloads are reliable.
- Interrupted downloads resume automatically.
- Integrity verification prevents corrupted artifacts.
- Download progress is available in real time.
- Provider adapters are extensible.
- Downloaded artifacts are handed off to the Model Installer.

---

# Risks

| Risk                  | Mitigation             |
| --------------------- | ---------------------- |
| Network interruptions | Resume support         |
| Corrupt downloads     | Checksum validation    |
| Large storage usage   | Download cache cleanup |
| Provider differences  | Adapter pattern        |

---

# Future Enhancements

- Peer-to-peer downloads
- LAN model sharing
- Enterprise mirrors
- Differential downloads
- Torrent support
- CDN selection
- Smart download scheduling

---

# Deliverables

- Model Downloader
- Download Scheduler
- Download Queue
- Resume Support
- Checksum Validator
- Download Manager UI
- Provider Download Adapters

---

# Traceability

Implements

- REQ-DOWNLOAD-001 Download Manager
- REQ-DOWNLOAD-002 Resume Support
- REQ-DOWNLOAD-003 Integrity Verification
- REQ-DOWNLOAD-004 Provider Downloads

Related ADRs

- ADR-039 Download Architecture
- ADR-040 Artifact Validation

Related Events

- download.started
- download.progress
- download.completed

Related Commands

- download.start
- download.pause
- download.resume

---

# Epic Completion Summary

**Target Release:** **v0.2.0 Alpha**

The Model Downloader provides a resilient, provider-independent download platform for AI models. It supports resumable downloads, integrity verification, concurrent scheduling, and extensible provider adapters, forming the foundation for reliable model acquisition in Open-Code.Studio.

---

# Changelog

## v1.0.0 (Planned)

- Initial Model Downloader specification.
- Added DownloadService, Scheduler, Queue, Resume Support, Checksum Validator, provider adapters, download UI, commands, events, and APIs.
