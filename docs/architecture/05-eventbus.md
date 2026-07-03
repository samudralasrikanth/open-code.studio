# Event Bus Architecture

> Version: 1.0

---

# Purpose

The Event Bus enables decoupled communication between independent subsystems.

Rather than directly invoking other modules, components publish events that interested consumers subscribe to.

---

# Benefits

- Loose coupling
- Better extensibility
- Easier testing
- Independent evolution
- Reduced dependency graph complexity

---

# Architecture

```text
Publisher

      │

      ▼

──────── Event Bus ────────

      ▲      ▲      ▲

      │      │      │

Explorer Git AI Search
```

Publishers never know who consumes an event.

---

# Event Lifecycle

```text
Action

↓

Event Created

↓

Published

↓

Subscribers Notified

↓

Handlers Execute
```

---

# Event Structure

Example:

```ts
{
  (id, timestamp, type, payload, source);
}
```

Events should be immutable.

---

# Event Categories

## Workspace

- WorkspaceOpened
- WorkspaceClosed
- WorkspaceReloaded

---

## Document

- DocumentOpened
- DocumentSaved
- DocumentClosed

---

## Editor

- EditorFocused
- EditorSplit
- SelectionChanged

---

## AI

- PromptSubmitted
- ToolExecuted
- CompletionReceived

---

## Extensions

- ExtensionInstalled
- ExtensionActivated
- ExtensionRemoved

---

# Event Delivery

Supported modes:

- Synchronous
- Asynchronous
- One-to-many
- Broadcast

Long-running handlers should execute asynchronously.

---

# Ordering

Event ordering is guaranteed only within a single publisher.

Consumers must not rely on global ordering.

---

# Error Handling

A failing subscriber must never prevent delivery to other subscribers.

Failures should be logged and isolated.

---

# Best Practices

Publish:

- Business events
- State changes
- Lifecycle transitions

Do not publish:

- UI rendering events
- Internal implementation details
- Extremely high-frequency events without throttling

---

# Performance

Avoid excessive event creation.

Use:

- Batching
- Debouncing
- Filtering

Monitor:

- Event count
- Queue length
- Handler duration

---

# Summary

The Event Bus forms the communication backbone of Open Code Studio, allowing independent modules to collaborate without direct dependencies.
