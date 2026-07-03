# EPIC-0012 — Theme Platform

| Property           | Value                                                    |
| ------------------ | -------------------------------------------------------- |
| Epic ID            | EPIC-0012                                                |
| Phase              | Phase 1 – IDE Platform                                   |
| Status             | 📋 Planned                                               |
| Priority           | Medium                                                   |
| Estimated Duration | 2 Weeks                                                  |
| Dependencies       | EPIC-0006 Document & Editor, EPIC-0011 Settings Platform |
| Blocks             | EPIC-0071 Plugin SDK, EPIC-0075 Theme Marketplace        |

---

# Overview

The Theme Platform provides a centralized theming system for Open-Code.Studio. It manages application colors, icons, typography, Monaco themes, terminal themes, and UI styling through a unified Theme Registry.

Unlike traditional CSS-based themes, every UI component consumes semantic design tokens exposed by the Theme Platform.

This allows themes to change dynamically without restarting the application.

---

# Vision

Build a professional theming platform comparable to VS Code while extending it to support:

- Light themes
- Dark themes
- High contrast themes
- Icon themes
- Terminal themes
- AI-generated themes
- Theme extensions
- Enterprise branding

without changing the application architecture.

---

# Objectives

## Functional

- Theme switching
- Monaco themes
- Terminal themes
- Icon themes
- Semantic color tokens
- Theme editor
- Theme preview
- Theme import/export
- Live updates

## Non-Functional

- Instant switching
- Platform independent
- Extensible
- Cached
- Event driven
- No application restart

---

# Scope

Included

- Theme Platform
- Theme Registry
- Theme Service
- Color Tokens
- Monaco Integration
- Terminal Integration
- Icon Themes
- Theme Preview

Excluded

- Marketplace
- Theme Publishing
- AI Theme Generator
- Cloud Sync

---

# Architecture

```
Workbench

↓

Theme Service

↓

Theme Registry

↓

Theme Provider

↓

Design Tokens

↓

Renderer
```

Renderer components consume design tokens instead of fixed colors.

---

# Package Structure

```
packages/theme/

domain/
    Theme
    ColorToken
    IconTheme
    TerminalTheme

application/
    ThemeService
    ThemeRegistry
    ThemeLoader
    ThemeValidator

infrastructure/
    JsonThemeLoader
    MonacoThemeAdapter
    TerminalThemeAdapter

events/
    ThemeEvents

commands/
    ThemeCommands
```

---

# Core Components

## Theme Service

Responsibilities

- Load themes
- Apply themes
- Notify subscribers
- Persist selection
- Validate themes

Acts as the central theme manager.

---

## Theme Registry

Stores

- Built-in themes
- Extension themes
- User themes

Future

- Marketplace themes

---

## Theme Model

```
id

name

author

version

colors

icons

terminal

monaco
```

---

## Color Tokens

Example

```
background.primary

background.secondary

text.primary

text.secondary

border.default

editor.background

sidebar.background

activityBar.background

statusBar.background
```

Components never reference hex colors directly.

---

## Icon Themes

Supports

- File icons
- Folder icons
- Language icons
- Explorer icons
- SCM icons

Future

Custom icon packs.

---

## Monaco Theme Adapter

Responsibilities

- Register Monaco themes
- Apply editor colors
- Map design tokens

---

## Terminal Theme Adapter

Responsibilities

- Apply ANSI colors
- Cursor
- Selection
- Background
- Foreground

---

# Renderer Components

```
ThemeSelector

ThemePreview

ThemeEditor

ThemeImportDialog
```

---

# Commands

```
theme.select

theme.reload

theme.preview

theme.import

theme.export

theme.reset
```

---

# Events

```
theme.loaded

theme.changed

theme.previewStarted

theme.previewEnded

theme.imported
```

---

# APIs

## ThemeService

```
getThemes()

getCurrent()

apply()

preview()

reload()

import()

export()
```

---

# IPC Contracts

Renderer

```
window.ocs.theme

list()

current()

apply()

preview()

reload()
```

Main

```
theme:list

theme:apply

theme:preview

theme:reload
```

---

# Stories

## STORY-0012-001

Theme Registry

Tasks

- Registry
- Metadata
- Built-in themes

---

## STORY-0012-002

Theme Service

Tasks

- Load
- Apply
- Persist

---

## STORY-0012-003

Monaco Integration

Tasks

- Monaco adapter
- Dynamic switching

---

## STORY-0012-004

Terminal Integration

Tasks

- ANSI colors
- Cursor theme

---

## STORY-0012-005

Icon Themes

Tasks

- File icons
- Folder icons
- Language icons

---

## STORY-0012-006

Theme UI

Tasks

- Theme selector
- Preview
- Import/export

---

# Complete Task Checklist

## Domain

- [ ] Theme model
- [ ] Color tokens
- [ ] Icon theme
- [ ] Terminal theme

## Application

- [ ] ThemeService
- [ ] Registry
- [ ] Loader
- [ ] Validator

## Infrastructure

- [ ] Monaco adapter
- [ ] Terminal adapter

## Renderer

- [ ] Theme selector
- [ ] Preview
- [ ] Theme editor

## Validation

- [ ] Unit tests
- [ ] Integration tests

---

# Manual Verification

✓ Switch themes

✓ Monaco updates immediately

✓ Terminal updates immediately

✓ Icons update

✓ Restart IDE

✓ Theme persists

✓ Import theme

✓ Export theme

---

# Automated Verification

```bash
pnpm --filter @ocs/theme test

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

The Theme Platform is complete when:

- Themes switch instantly.
- Monaco, Terminal, and Workbench share a unified theme.
- Components consume semantic color tokens.
- Icon themes are supported.
- Themes persist across sessions.
- Extensions can contribute themes.

---

# Risks

| Risk                  | Mitigation               |
| --------------------- | ------------------------ |
| Hardcoded colors      | Design token enforcement |
| Theme inconsistencies | Shared registry          |
| Third-party adapters  | Dedicated adapters       |
| Performance           | Cached theme objects     |

---

# Future Enhancements

- Theme Marketplace
- AI Theme Generator
- Dynamic Accent Colors
- Workspace-specific Themes
- Organization Branding
- Theme Packs

---

# Deliverables

- Theme Platform
- Theme Registry
- Theme Service
- Monaco Theme Adapter
- Terminal Theme Adapter
- Icon Themes
- Theme Selector

---

# Traceability

Implements

- REQ-THEME-001 Theme Management
- REQ-THEME-002 Design Tokens
- REQ-THEME-003 Icon Themes
- REQ-THEME-004 Theme Switching

Related ADRs

- ADR-026 Theme Platform
- ADR-027 Design Token System

Related Events

- theme.changed
- theme.loaded

Related Commands

- theme.select
- theme.preview

---

# Epic Completion Summary

**Target Release:** v0.1.0 Alpha

The Theme Platform provides a centralized, token-based theming architecture that enables consistent styling across the workbench, Monaco editor, terminal, and future extensions while laying the foundation for a theme marketplace and enterprise branding.

---

# Changelog

## v1.0.0 (Planned)

- Initial Theme Platform specification.
- Added ThemeService, Theme Registry, design token system, Monaco and Terminal adapters, icon themes, theme selector, commands, events, and APIs.
