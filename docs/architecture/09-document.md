# Document Architecture

> Version: 1.0

---

# Purpose

The Document subsystem represents files loaded into memory.

A document exists independently of any editor.

Multiple editors may reference the same document instance.

---

# Responsibilities

- Document lifecycle
- Dirty state
- Save pipeline
- Encoding
- Undo/redo coordination
- Version tracking
- Conflict detection

---

# Document Model

```ts
Document

├── id

├── uri

├── language

├── encoding

├── version

├── dirty

├── readonly

└── content
```

---

# Lifecycle

```text
Open

↓

Load

↓

Edit

↓

Dirty

↓

Save

↓

Clean

↓

Close
```

---

# Dirty State

A document becomes dirty after its first modification.

Transitions:

```text
Clean

↓

Modified

↓

Saved

↓

Clean
```

Dirty state changes are published through the Event Bus.

---

# Save Pipeline

```text
Editor

↓

Validation

↓

Formatting

↓

Encoding

↓

Filesystem

↓

Success
```

Pre-save hooks may execute before persistence.

---

# Versioning

Each modification increments the document version.

Example:

```text
v1

↓

v2

↓

v3

↓

v4
```

Version numbers support:

- Undo
- Redo
- Conflict detection
- AI context synchronization

---

# Encoding

Supported encodings include:

- UTF-8
- UTF-16
- ASCII
- ISO-8859-1

Encoding changes require explicit user confirmation.

---

# Undo / Redo

History is maintained independently of the editor.

Benefits:

- Multiple editor support
- Stable history
- Shared state

---

# Conflict Resolution

Conflicts may occur when:

- File changed externally
- Git checkout
- Merge
- Remote synchronization

Users should be presented with resolution options.

---

# Events

Publishes:

- DocumentOpened
- DocumentChanged
- DocumentSaved
- DocumentClosed

Consumes:

- FileModifiedExternally
- WorkspaceClosed

---

# Memory Management

Unused documents may be:

- Cached
- Suspended
- Released

Policies should balance memory usage and user experience.

---

# Performance

- Incremental updates
- Shared buffers
- Efficient diffing
- Lazy loading for large files

---

# Security

Validate:

- File permissions
- Encoding
- External modifications
- Workspace boundaries

---

# Related Documents

- 07-workspace.md
- 10-editor.md
- 17-performance.md

---

# Summary

The Document subsystem provides an in-memory representation of workspace files that is independent of any specific editor. This separation enables multiple views, reliable undo/redo, robust save handling, and efficient synchronization across the application.
