# Duplicate Epics Report

This document reports the epic files that contain duplicated template content from their preceding epics. These are marked as documentation defects to be regenerated during their respective phases under Change Control.

---

## 1. Summary of Duplicate Epics

| Epic File                           | Duplicated Template Content        | Similarity | Status / Phase                  | Action / Recommendation                                   |
| ----------------------------------- | ---------------------------------- | ---------- | ------------------------------- | --------------------------------------------------------- |
| `EPIC-0049-Agent-Registry.md`       | `EPIC-0048-Organization-Memory.md` | 100.00%    | Phase 6 — Agent Platform        | Regenerate when starting Milestone 4 (Agent Host).        |
| `EPIC-0058-Workflow-Core.md`        | `EPIC-0057-Agent-Metrics.md`       | 100.00%    | Phase 7 — Workflow Engine       | Regenerate when starting Phase 7.                         |
| `EPIC-0067-Workspace-Trust.md`      | `EPIC-0066-RBAC.md`                | 100.00%    | Phase 8 — Security & Governance | Regenerate when starting Phase 8.                         |
| `EPIC-0073-Marketplace.md`          | `EPIC-0072-Extension-Loader.md`    | 100.00%    | Phase 9 — Extension Ecosystem   | Regenerate when starting Phase 9 (Extension Marketplace). |
| `EPIC-0076-Workflow-Marketplace.md` | `EPIC-0075-Theme-Marketplace.md`   | 100.00%    | Phase 9 — Extension Ecosystem   | Regenerate when starting Phase 9 (Workflow Marketplace).  |
| `EPIC-0085-Live-Presence.md`        | `EPIC-0084-Shared-Workspaces.md`   | 100.00%    | Phase 11 — Collaboration        | Regenerate when starting Phase 11 (CRDT collab).          |
| `EPIC-0103-Browser-IDE.md`          | `EPIC-0102-Backup-and-Restore.md`  | 100.00%    | Phase 15 — Platform Expansion   | Regenerate when starting Phase 15.                        |
| `EPIC-0106-Mobile-Companion.md`     | `EPIC-0105-Remote-Runtime.md`      | 100.00%    | Phase 15 — Platform Expansion   | Regenerate when starting Phase 15.                        |

---

## 2. Mitigation Guidelines

1. **Do Not Implement Conflicting Content:** Developers and AI agents must ignore the duplicated body text inside these stubs. Refer instead to the master `PROJECT_SPEC.md` and `ROADMAP.md` for their actual requirements and deliverables.
2. **Phase-Gate Regeneration:** When feature development reaches a phase containing a duplicate epic, that epic must be regenerated with its correct content under Change Control rules before implementing any of its stories.
3. **Preserve Metadata:** Keep the original file names, IDs, and priorities intact to ensure graph traceability remains active.
