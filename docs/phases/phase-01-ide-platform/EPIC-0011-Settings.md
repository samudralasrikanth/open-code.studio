# EPIC-0011 — Settings Platform

| Property           | Value                                                                               |
| ------------------ | ----------------------------------------------------------------------------------- |
| Epic ID            | EPIC-0011                                                                           |
| Phase              | Phase 1 – IDE Platform                                                              |
| Status             | 📋 Planned                                                                          |
| Priority           | High                                                                                |
| Estimated Duration | 2 Weeks                                                                             |
| Dependencies       | EPIC-0004 Workspace, EPIC-0006 Document & Editor, EPIC-0009 Command Palette         |
| Blocks             | EPIC-0012 Theme Platform, EPIC-0014 Keyboard Shortcuts, Phase 9 Extension Ecosystem |

---

# Overview

The Settings Platform provides a centralized configuration system for Open-Code.Studio. It manages user, workspace, and future organization-level settings through a strongly typed configuration registry with validation, inheritance, change notifications, and persistence.

Rather than every package managing its own configuration, all settings flow through a single Settings Platform.

---

# Vision

Build a settings system comparable to VS Code while extending it to support enterprise policy enforcement, AI preferences, extension settings, and cloud synchronization.

Future consumers include:

- IDE Platform
- Runtime
- Gateway
- Knowledge Engine
- Memory Platform
- AI Agents
- Extensions
- Enterprise Policies

---

# Objectives

## Functional

- User Settings
- Workspace Settings
- Default Settings
- Settings Editor
- JSON Editor
- Search Settings
- Setting Validation
- Setting Reset
- Import/Export Settings

## Non-Functional

- Type-safe
- Extensible
- Reactive
- Cached
- Schema-driven
- Event-driven

---

# Scope

Included

- Settings Platform
- Settings Registry
- Settings Service
- Settings UI
- JSON Editor
- Workspace Settings
- User Settings
- Validation
- Settings Search

Excluded

- Cloud Sync
- Organization Policies
- Remote Settings
- Extension Marketplace Sync

---

# Architecture

```
Workbench

↓

Settings Editor

↓

Settings Service

↓

Settings Registry

↓

Settings Storage

↓

JSON Files
```

All settings modifications pass through the Settings Service.

---

# Package Structure

```
packages/settings/

domain/
    Setting
    SettingSchema
    SettingScope
    SettingValue

application/
    SettingsService
    SettingsRegistry
    SettingsValidator
    SettingsSearch

infrastructure/
    JsonSettingsStore
    WorkspaceSettingsStore
    UserSettingsStore

events/
    SettingsEvents

commands/
    SettingsCommands
```

---

# Core Components

## Settings Service

Responsibilities

- Read settings
- Update settings
- Validate values
- Notify subscribers
- Persist changes

Acts as the platform entry point.

---

## Settings Registry

Maintains metadata for every setting.

Example

```
editor.fontSize

editor.wordWrap

terminal.integrated.fontSize

git.autoFetch

theme.current
```

Future

Extension-contributed settings.

---

## Setting Scopes

Supported scopes

```
Default

User

Workspace

Folder (Future)

Organization (Future)
```

Priority

```
Organization

↓

Folder

↓

Workspace

↓

User

↓

Default
```

---

## Validation Engine

Supports

- Type validation
- Enum validation
- Range validation
- Regex validation
- Custom validators

---

## Settings Search

Supports

- Keyword search
- Category filtering
- Modified settings
- Recently changed
- Extension settings

---

# Settings Storage

Current

```
~/.open-code/settings.json

workspace/.ocs/settings.json
```

Future

```
Cloud Sync

Enterprise Policies
```

---

# Renderer Components

```
SettingsEditor

SettingsTree

SettingsSearch

SettingsCategory

JsonSettingsEditor

ModifiedSettingsView
```

---

# Commands

```
settings.open

settings.openJson

settings.reset

settings.export

settings.import

settings.search

settings.showModified
```

---

# Events

```
settings.changed

settings.reset

settings.loaded

settings.saved

settings.validationFailed
```

---

# APIs

## SettingsService

```
get()

set()

reset()

search()

validate()

export()

import()

subscribe()
```

---

# IPC Contracts

Renderer

```
window.ocs.settings

get()

set()

reset()

search()

export()

import()
```

Main

```
settings:get

settings:set

settings:reset

settings:search
```

---

# Stories

## STORY-0011-001

Settings Registry

Tasks

- Registry
- Metadata
- Categories

---

## STORY-0011-002

Settings Service

Tasks

- Read
- Write
- Cache
- Events

---

## STORY-0011-003

Validation

Tasks

- Type validation
- Enum validation
- Custom validators

---

## STORY-0011-004

Settings Editor

Tasks

- Categories
- Search
- Modified view

---

## STORY-0011-005

JSON Settings

Tasks

- JSON editor
- Validation
- Error reporting

---

## STORY-0011-006

Import & Export

Tasks

- Export settings
- Import settings
- Merge strategy

---

## Complete Task Checklist

## Domain

- [ ] Setting model
- [ ] Scope model
- [ ] Schema model

## Application

- [ ] SettingsService
- [ ] Registry
- [ ] Validator
- [ ] Search

## Infrastructure

- [ ] User settings store
- [ ] Workspace settings store

## Renderer

- [ ] Settings UI
- [ ] JSON editor
- [ ] Search

## Validation

- [ ] Unit tests
- [ ] Integration tests

---

# Manual Verification

✓ Change user setting

✓ Change workspace setting

✓ Search settings

✓ Invalid values rejected

✓ Settings persist after restart

✓ Export settings

✓ Import settings

---

# Automated Verification

```bash
pnpm --filter @ocs/settings test

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

The Settings Platform is complete when:

- User and workspace settings are supported.
- Every setting is schema validated.
- Settings are searchable.
- JSON editing is supported.
- Changes notify all subscribers immediately.
- Extensions can register new settings without modifying the core platform.

---

# Risks

| Risk                  | Mitigation               |
| --------------------- | ------------------------ |
| Invalid configuration | Schema validation        |
| Conflicting scopes    | Deterministic precedence |
| Extension conflicts   | Registry ownership rules |
| Performance           | Cached settings          |

---

# Future Enhancements

- Cloud Sync
- Enterprise Policies
- Extension Settings
- AI Preferences
- Settings Profiles
- Workspace Templates

---

# Deliverables

- Settings Platform
- Settings Registry
- Settings Service
- Validation Engine
- Settings Editor
- JSON Editor
- Import/Export

---

# Traceability

Implements

- REQ-SET-001 Settings Management
- REQ-SET-002 Validation
- REQ-SET-003 Search
- REQ-SET-004 Settings Editor

Related ADRs

- ADR-024 Settings Platform
- ADR-025 Configuration Registry

Related Events

- settings.changed
- settings.saved

Related Commands

- settings.open
- settings.reset

---

# Epic Completion Summary

**Target Release:** v0.1.0 Alpha

The Settings Platform establishes a unified, schema-driven configuration system for Open-Code.Studio, supporting user and workspace settings while providing the extensibility required for future AI, enterprise, and extension-based configuration.

---

# Changelog

## v1.0.0 (Planned)

- Initial Settings Platform specification.
- Added SettingsService, Registry, Validation Engine, Settings Editor, JSON editor, import/export, commands, events, and APIs.
