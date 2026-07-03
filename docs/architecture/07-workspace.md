# Workspace Architecture

> Version: 1.0

---

# Purpose

The Workspace subsystem is the central coordination layer of Open Code Studio.

A workspace represents one or more project roots together with their configuration, metadata, file watchers, search indexes, and runtime context.

Nearly every subsystem depends on the Workspace Service.

---

# Responsibilities

The Workspace subsystem is responsible for:

- Opening workspaces
- Closing workspaces
- Multi-root support
- Workspace configuration
- File watching
- Search indexing
- Trust management
- Workspace lifecycle events

---

# Non-Responsibilities

The Workspace subsystem does **not**:

- Edit documents
- Render UI
- Execute AI requests
- Manage Git repositories
- Execute extensions

---

# Architecture

```text
                 Workspace
                      │
      ┌───────────────┼───────────────┐
      │               │               │
      ▼               ▼               ▼
 Configuration   File Watcher   Search Index
      │               │               │
      ▼               ▼               ▼
 Workspace DB    Events Bus     Explorer
```

---

# Workspace Model

```ts
Workspace

├── id

├── name

├── roots[]

├── settings

├── state

├── trust

├── metadata

└── indexes
```

---

# Workspace Lifecycle

```text
Create

↓

Initialize

↓

Load Configuration

↓

Open Roots

↓

Start Watchers

↓

Index Files

↓

Ready

↓

Close
```

---

# Multi-Root Workspaces

Supported features:

- Multiple folders
- Independent settings
- Shared search
- Shared extensions
- Shared tasks

Each root maintains independent metadata while sharing a common workspace context.

---

# Configuration Hierarchy

Configuration precedence:

```text
Default

↓

User

↓

Workspace

↓

Folder

↓

Runtime
```

Higher levels override lower levels.

---

# Workspace Trust

Workspace trust determines whether potentially unsafe features may execute.

Examples:

- Extension activation
- Terminal execution
- AI tool execution
- Task execution

Untrusted workspaces should operate in a restricted mode.

---

# File Watching

The Workspace Service coordinates filesystem watchers.

Events include:

- Created
- Modified
- Deleted
- Renamed

Events are published through the Event Bus.

---

# Search Index

The Workspace Service owns the search index lifecycle.

Features:

- Incremental updates
- Background indexing
- Ignore rules
- Symbol indexing (future)

---

# State Management

Workspace states:

```text
Closed

↓

Opening

↓

Indexing

↓

Ready

↓

Closing
```

Consumers should observe state transitions rather than polling.

---

# Public Interfaces

```ts
IWorkspaceService;

IWorkspaceConfiguration;

IWorkspaceWatcher;
```

---

# Performance

- Lazy initialization
- Incremental indexing
- Batched filesystem events
- Cached metadata

---

# Security

- Validate workspace paths
- Prevent directory traversal
- Respect trust boundaries
- Isolate external mounts

---

# Related Documents

- 03-platform-layer.md
- 05-eventbus.md
- 08-explorer.md
- 09-document.md

---

# Summary

The Workspace subsystem provides the operational context for every feature in Open Code Studio. It owns project lifecycle, configuration hierarchy, and filesystem awareness while remaining independent of the user interface.
