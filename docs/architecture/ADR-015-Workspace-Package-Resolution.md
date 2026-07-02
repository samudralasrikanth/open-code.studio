# ADR 015: Workspace Package Resolution in Vite

## Status

Accepted

## Context

During the implementation of the Explorer Platform (EPIC-0005), we encountered a significant build issue when the `apps/studio` renderer attempted to import the `PlatformError` class from `@ocs/common/errors`.

The underlying issue stems from an impedance mismatch between TypeScript's NodeNext module resolution and Vite's build pipeline:

1. TypeScript requires `.js` extensions in import paths for ESM modules (e.g., `import { PlatformError } from "@ocs/common/errors/index.js"`).
2. Because this is a monorepo, importing a local workspace package resolves to the raw `.ts` source files during development (when not pre-built).
3. When Vite intercepts an import ending in `.js`, but the underlying file is actually `.ts` (because we haven't built the package yet), it fails with `ENOTDIR` or module resolution errors if it does not correctly alias the request to the source file.

To resolve this, we could:

- Pre-build every package on every change (slow).
- Strip `.js` extensions in imports (breaks Node runtime).
- Force Vite to resolve `@ocs/*` imports directly to the package source files using regular expressions.

## Decision

We decided to configure Vite to use regex-based aliases for all workspace packages (`@ocs/*`) rather than relying on direct resolution or pre-building.

In `apps/studio/electron.vite.config.ts`:

```typescript
resolve: {
  alias: [
    {
      find: /^@ocs\/(.*)/,
      replacement: resolve(__dirname, "../../packages/$1/src/index.ts")
    }
  ];
}
```

## Consequences

### Positive

- **Developer Experience**: We do not need to constantly run `tsc -b` on the packages when making changes during development. HMR works out of the box because Vite reads the source `.ts` files directly.
- **Runtime Compatibility**: We can strictly adhere to the `NodeNext` ESM rules (`.js` extensions in imports) because Vite intercepts the `@ocs/` prefix before it evaluates the file extension.

### Negative

- **Configuration Overhead**: We must manually map the regex alias paths, and this assumes all packages have an `index.ts` entry point at `src/index.ts`.
- **Maintenance**: If we introduce new nested packages (like `@ocs/common/config`), we might need to adjust the alias regex to handle nested path resolutions properly (e.g., capturing the sub-path and replacing it correctly).
