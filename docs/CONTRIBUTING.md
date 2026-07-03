# Contributing to Open Code Studio

> Version: 1.0  
> Status: Living Document

---

# Welcome

Thank you for your interest in contributing to Open Code Studio.

Our goal is to build a modern, AI-first development platform with high engineering standards. Every contribution—whether code, documentation, testing, design, or discussion—helps improve the project.

Please read this document before opening a Pull Request.

---

# Table of Contents

1. Code of Conduct
2. Ways to Contribute
3. Development Setup
4. Repository Structure
5. Branch Strategy
6. Commit Guidelines
7. Pull Request Process
8. Coding Standards
9. Testing Requirements
10. Documentation Requirements
11. Architecture Rules
12. Issue Workflow
13. Security Reporting
14. Release Process

---

# Code of Conduct

Contributors are expected to:

- Be respectful.
- Be constructive during reviews.
- Focus on technical discussions.
- Accept feedback professionally.
- Keep discussions on-topic.

Harassment, discrimination, or abusive behavior will not be tolerated.

---

# Ways to Contribute

We welcome contributions in the following areas:

- Bug fixes
- New features
- Documentation
- Performance improvements
- Security enhancements
- Accessibility
- Tests
- Developer tooling
- Extension development

---

# Development Setup

## Prerequisites

- Node.js (LTS)
- pnpm
- Git
- Visual Studio Code (recommended)

## Clone Repository

```bash
git clone https://github.com/<org>/open-code.studio.git
cd open-code.studio
```

## Install Dependencies

```bash
pnpm install
```

## Start Development

```bash
pnpm dev
```

## Run Tests

```bash
pnpm test
```

## Run Lint

```bash
pnpm lint
```

## Build

```bash
pnpm build
```

---

# Repository Structure

```
apps/
packages/
extensions/
tools/
docs/
scripts/
```

Refer to `ARCHITECTURE.md` for a detailed explanation.

---

# Branch Strategy

Use the following naming convention:

### Features

```
feature/editor-tabs
feature/ai-chat
feature/workspace-search
```

### Bug Fixes

```
fix/editor-crash
fix/ipc-memory-leak
```

### Documentation

```
docs/architecture-update
docs/api-guide
```

### Refactoring

```
refactor/workbench-layout
```

### Performance

```
perf/file-indexer
```

---

# Commit Message Format

Follow the Conventional Commits specification.

Examples:

```
feat(editor): add split editor support

fix(workspace): prevent duplicate watchers

docs(api): update IPC examples

test(editor): improve tab coverage

refactor(platform): simplify DI container

perf(search): optimize indexing
```

---

# Pull Request Checklist

Before submitting a Pull Request, ensure:

- Code builds successfully.
- Tests pass.
- Lint passes.
- Documentation is updated.
- No unnecessary dependencies were added.
- Public APIs are documented.
- Backward compatibility is maintained where applicable.

---

# Pull Request Template

Each Pull Request should include:

## Summary

Describe what changed.

## Motivation

Explain why the change is needed.

## Testing

Describe how the change was tested.

## Screenshots

Include screenshots for UI changes.

## Breaking Changes

List any breaking changes.

## Related Issues

Reference related GitHub issues.

---

# Coding Standards

Follow:

```
docs/CODING_STANDARDS.md
```

Highlights:

- Prefer TypeScript.
- Avoid `any`.
- Use dependency injection.
- Favor composition over inheritance.
- Write self-documenting code.
- Keep functions small and focused.
- Avoid global mutable state.

---

# Architecture Rules

Contributors must respect architectural boundaries.

### Do

- Use services through interfaces.
- Communicate using the Event Bus where appropriate.
- Keep renderer and main process separated.
- Validate IPC inputs.
- Reuse platform services.

### Don't

- Access Node APIs from the renderer.
- Introduce circular dependencies.
- Bypass dependency injection.
- Duplicate existing services.
- Mix UI logic with business logic.

---

# Testing Requirements

Every contribution should include appropriate tests.

| Change Type              | Required Tests                         |
| ------------------------ | -------------------------------------- |
| Bug Fix                  | Unit Test                              |
| New Feature              | Unit + Integration                     |
| UI Change                | Component + Screenshot (if applicable) |
| Platform Service         | Unit + Integration                     |
| Extension API            | Compatibility Tests                    |
| Performance Optimization | Benchmark (if measurable)              |

Refer to:

```
docs/TESTING_GUIDELINES.md
```

---

# Documentation Requirements

Update documentation when:

- Public APIs change.
- Architecture changes.
- Configuration changes.
- Commands change.
- User-facing behavior changes.

Relevant documents include:

- PROJECT_SPEC.md
- ROADMAP.md
- ARCHITECTURE.md
- API_GUIDELINES.md
- SECURITY_GUIDELINES.md

---

# Issue Workflow

Before creating an issue:

- Search existing issues.
- Reproduce the problem.
- Use the issue template.
- Include logs where relevant.
- Provide environment details.

Bug reports should include:

- Expected behavior
- Actual behavior
- Reproduction steps
- Screenshots (if applicable)
- Platform information

---

# Feature Requests

Feature requests should explain:

- Problem being solved
- Proposed solution
- Alternative solutions considered
- Potential impact
- Compatibility considerations

---

# Code Review Process

Every Pull Request is reviewed for:

- Correctness
- Readability
- Maintainability
- Performance
- Security
- Test coverage
- Documentation

Reviewers may request changes before approval.

---

# Dependency Policy

When adding dependencies:

- Justify the need.
- Prefer existing libraries already in use.
- Evaluate maintenance status.
- Consider bundle size.
- Review security implications.
- Avoid overlapping functionality.

---

# Security Reporting

Do **not** open public issues for security vulnerabilities.

Instead:

- Report privately to the maintainers.
- Include reproduction steps.
- Provide proof of concept if applicable.
- Allow time for coordinated disclosure.

Refer to:

```
docs/SECURITY_GUIDELINES.md
```

---

# Release Process

Contributions are merged into the main branch after:

1. Code review approval.
2. Successful CI.
3. Passing test suite.
4. Documentation review (if required).

Releases follow semantic versioning:

- MAJOR – Breaking changes
- MINOR – New features
- PATCH – Bug fixes

See:

```
docs/RELEASES.md
```

---

# Contributor Recognition

We value all forms of contribution, including:

- Code
- Documentation
- Testing
- Design
- Performance improvements
- Security research
- Community support
- Extension development

Contributors may be acknowledged in release notes and project documentation.

---

# Questions?

If you're unsure about an implementation or architectural decision:

1. Review the documentation.
2. Search existing issues and discussions.
3. Open a discussion before making large changes.

Early collaboration helps avoid unnecessary work and keeps the project aligned.

---

Thank you for helping build Open Code Studio.
