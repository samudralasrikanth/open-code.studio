# EPIC-0101 — Crash Reporting

| Property           | Value                                  |
| ------------------ | -------------------------------------- |
| Epic ID            | EPIC-0101                              |
| Phase              | Phase 14 — Platform Operations         |
| Status             | 📋 Planned                             |
| Priority           | Critical                               |
| Estimated Duration | 2 Weeks                                |
| Dependencies       | EPIC-0093 Telemetry, EPIC-0094 Logging |
| Blocks             | Platform Reliability                   |

---

# 1. Overview

Crash Reporting automatically captures application crashes, uncaught exceptions, fatal errors, plugin failures, and AI runtime failures.

Reports are anonymized, symbolicated, and correlated with logs and traces.

---

# 2. Vision

Detect failures before users report them while protecting user privacy.

Captured Events

- Native Crashes
- Renderer Crashes
- Plugin Crashes
- AI Errors
- IPC Failures
- Memory Failures

---

# 3. Goals

- Automatic reporting
- Stack traces
- Symbolication
- Correlation
- Privacy filtering
- Recovery suggestions

---

# 4. Scope

Included

- Crash Reporter
- Symbolication
- Upload
- Diagnostics

Excluded

- Health monitoring

---

# 5. Architecture

```mermaid
flowchart LR

Crash

↓

Crash Reporter

↓

Diagnostics

↓

Upload

↓

Dashboard
```

---

# 6. Components

- Crash Reporter
- Symbolicator
- Upload Service
- Diagnostics Engine
- Report Viewer

---

# 7. APIs

```typescript
capture();

reports();

diagnostics();

upload();

statistics();
```

---

# 8. IPC

```
crash.capture

crash.report
```

---

# 9. Commands

```
crash.export
crash.submit
```

---

# 10. Events

```
crash.detected
report.generated
report.uploaded
```

---

# 11. Stories

- Crash Capture
- Diagnostics
- Upload
- Dashboard

---

# 12. Tasks

- [ ] Crash reporter
- [ ] Symbolication
- [ ] Upload
- [ ] Dashboard

---

# 13. Performance

| Metric            | Target    |
| ----------------- | --------- |
| Capture           | Immediate |
| Report Generation | <2 sec    |

---

# 14. Definition of Done

- Crash reporting operational
- Diagnostics available
- Reports uploadable
- Coverage ≥90%

---

# 15. Acceptance Criteria

- Crashes captured
- Reports correlated
- Diagnostics accurate
- Privacy preserved

---

# 16. Risks

- Sensitive information
- Upload failures
- Missing symbols

---

# 17. Future

- AI root-cause analysis
- Automatic issue creation
- Predictive crash detection

---

# 18. Deliverables

- Crash Reporter
- Diagnostics Engine
- Report Viewer

---

# 19. Traceability

Requirements

- REQ-OPS-006

Related ADRs

- ADR-150 Crash Reporting

---

# 20. Changelog

v1.0 Initial Specification
