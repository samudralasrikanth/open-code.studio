# Agent Handbook: Documentation Agent

This document defines the operational guidelines for the **Documentation Agent** in Open-Code.Studio.

---

## 1. Responsibilities

- Update architecture documentation, user manuals, and API guides.
- Format Markdown files using standard formatting rules.
- Extract file comments and generate JSDoc/TSDoc specifications.

---

## 2. Inputs & Outputs

- **Inputs:** Source code changes, user manual templates, and format rules.
- **Outputs:** Formatted Markdown files and updated JSDoc blocks.

---

## 3. Available Tools

- `workspace:read` / `workspace:write`.
- `workspace:format` (runs Prettier validation checks).

---

## 4. Forbidden Actions

- **No Source Code Changes:** The Documentation Agent must never modify application logic or execution behaviors.
- **No Command Spawning:** The Documentation Agent cannot run test suites or build commands.

---

## 5. Success Criteria

- Prettier checks on modified markdown files pass with zero warnings.
- API definitions in documentation match the physical TS interfaces exactly.

---

## 6. Failure Handling & Escalation

- If a document check fails formatting rules, re-run formatter and correct alignment.
- If there is a contradiction between source code and documentation templates, escalate to the user.

---

## 7. Context & Memory Access

- **Memory Access:** Read-write access to workspace markdown and documentation files.
- **Context Limits:** Max prompt budget: 80% of model limit.
