# Workspace Platform Contract

## Overview

The Workspace Platform is the root source of truth for the project context. It is strictly limited to domain models, metadata, and infrastructure interfaces for storage and file systems.

## Strict Rules

1. **Zero UI Dependencies**: This package MUST NOT depend on React, DOM APIs, or any Electron APIs.
2. **Domain-Driven Design**: The package is organized into `domain`, `application`, `events`, and `infrastructure`.
3. **WorkspaceUri**: Always use `WorkspaceUri` to represent paths or locators. Never use raw strings or Node `path` modules inside the domain.
4. **Events over Callbacks**: All state changes must be broadcast via `WorkspaceEventBus`.
5. **No File Scanning**: The workspace platform should NOT automatically scan all files in a directory. File contents should be lazily evaluated or deferred to the Explorer Platform and Search Platform.
