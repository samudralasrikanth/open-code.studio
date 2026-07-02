# Common Package Contract

## Overview

The Common package provides ubiquitous language primitives, utilities, base classes, and cross-cutting concerns (like errors, logging, and events).

## Strict Rules

1. **Zero Domain Logic**: Common MUST NOT contain business rules or domain logic. It should not know about "Workspaces", "Files", or "Editors".
2. **Zero External Heavy Dependencies**: Do not import React, Electron, or large runtime libraries.
3. **Platform Agnostic**: All code in common must run seamlessly in Node.js, Browser, and Web Worker environments.
4. **Export Hygiene**: Only expose generic utilities. If something is specific to one domain, it belongs in that domain's package, not in common.
