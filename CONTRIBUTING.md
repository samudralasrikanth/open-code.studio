# Contributing

## Workflow

1. Create a branch linked to a story or task.
2. Keep changes scoped to the package or domain that owns the behavior.
3. Update package documentation and changelogs when public behavior changes.
4. Run `pnpm validate` before opening a pull request.

## Commit Messages

Commits use the Conventional Commits format:

```text
type(scope): summary
```

Examples:

- `feat(runtime): add model registry contract`
- `fix(gateway): handle provider timeout`
- `docs(repo): document local setup`

## Package Boundaries

Applications contain presentation logic. Platform logic belongs in `packages/` or `services/`.

Packages expose public APIs only through `src/index.ts`. Internal implementation details stay inside the package and are not imported directly by other workspaces.

**Never import another package's internal files.**

```text
# Correct — import from the public entry point
import { createLogger } from '@ocs/common'

# Wrong — bypasses the package boundary
import { Logger } from '@ocs/common/src/logger/index.ts'
import { Logger } from '@ocs/common/logger/src/index.js'
```

Violating this rule creates invisible coupling between packages that the architecture validator cannot detect. If you need a type or function that is not exported from `src/index.ts`, the correct fix is to promote it to the public API, not to reach inside the package.

## Review Checklist

- The change has a linked story or task.
- Tests cover new behavior.
- Public APIs are documented.
- Architecture validation passes.
- No generated files were edited manually.
