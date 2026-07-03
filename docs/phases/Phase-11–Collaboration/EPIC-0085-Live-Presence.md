# EPIC-0085 — Live Presence

| Property           | Value                             |
| ------------------ | --------------------------------- |
| Epic ID            | EPIC-0085                         |
| Phase              | Phase 11 — Collaboration Platform |
| Status             | 📋 Planned                        |
| Priority           | High                              |
| Estimated Duration | 3 Weeks                           |
| Dependencies       | EPIC-0084 Shared Workspaces       |
| Blocks             | Shared Reviews                    |

---

# 1. Overview

Live Presence enables developers to see who is currently active within a workspace, what they are working on, and where collaboration is occurring in real time.

It provides awareness without requiring continuous communication.

---

# 2. Vision

Deliver real-time collaboration awareness similar to Figma and Google Docs while remaining optimized for software development.

Presence Features

- Online Users
- Active Files
- Cursor Presence
- AI Activity
- Current Workflow
- Current Branch
- Terminal Sessions
- Debug Sessions

---

# 3. Goals

- User presence
- Activity tracking
- Cursor sharing
- AI presence
- Session awareness
- Notifications

---

# 4. Scope

Included

- Presence Service
- Activity Broadcast
- Session Tracking
- Presence UI

Excluded

- Voice presence
- Video streaming

---

# 5. Architecture

```mermaid
flowchart LR

Client

↓

Presence Service

↓

Workspace

↓

Broadcast

↓

Connected Users
```

---

# 6. Components

- Presence Service
- Session Tracker
- Broadcast Engine
- Activity Monitor
- Notification Service

---

# 7. Interfaces

```typescript
presence();

status();

activities();

sessions();

users();
```

---

# 8. IPC

```
presence.update
presence.list
presence.subscribe
```

---

# 9. Commands

```
presence.enable
presence.disable
presence.status
```

---

# 10. Events

```
user.joined
user.left
presence.updated
activity.changed
```

---

# 11. Stories

- Presence Service
- Activity Tracking
- Session Tracking
- Notifications
- UI Indicators

---

# 12. Tasks

- [ ] Presence engine
- [ ] Session tracking
- [ ] Broadcast service
- [ ] UI indicators

---

# 13. Metrics

| Metric          | Target  |
| --------------- | ------- |
| Presence Update | <50 ms  |
| User Join       | <200 ms |
| Broadcast       | <20 ms  |

---

# 14. Verification

- Presence operational
- Activity synchronized
- Notifications enabled
- Coverage ≥90%

---

# 15. Acceptance Criteria

- Users visible
- Activities synchronized
- Sessions tracked
- Presence updates reliable

---

# 16. Risks

- Excessive network traffic
- Privacy concerns
- Large team scaling

---

# 17. Future

- Voice presence
- AI presence avatars
- Smart collaboration suggestions

---

# 18. Deliverables

- Presence Service
- Session Tracker
- Activity Broadcast

---

# 19. Traceability

Requirements

- REQ-COLLAB-002
- REQ-COLLAB-003

Related ADRs

- ADR-134 Live Presence

---

# 20. Changelog

v1.0 Initial Specification
