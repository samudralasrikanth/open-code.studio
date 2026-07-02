# Release Process

Open-Code.Studio uses Semantic Versioning and Changesets.

## Release Checklist

Every release must pass this gate in order. No step may be skipped.

```text
1. Validate          pnpm validate
                     (format → lint → typecheck → test → arch → docs → build)

2. Coverage          All packages meet minimum thresholds
                     (lines ≥ 90%, functions ≥ 90%, branches ≥ 80%)

3. Architecture      pnpm arch:check passes with zero failures

4. Dependencies      pnpm deps:check — no disallowed cross-layer deps
                     No known high or critical vulnerabilities

5. Performance       Startup time measured and within spec (< 3 s cold)
                     Idle memory within spec (< 200 MB)

6. Security Scan     pnpm audit — no high or critical advisories
                     CSP headers verified on all renderer windows

7. Changeset         pnpm release:notes — all changes documented
                     pnpm release:version — versions and changelogs updated

8. Package           pnpm run package — platform bundles built

9. Publish           pnpm release:publish — artifacts published from CI
                     Release notes attached to the GitHub release
```

## Prepare a Change

```sh
pnpm release:notes
```

Describe the package impact and whether the change is major, minor, or patch.

## Version Packages

```sh
pnpm release:version
```

This updates package versions and changelogs.

## Publish

```sh
pnpm release:publish
```

Publishing requires CI validation, artifact checksums, and release notes. Digital signing is reserved for the future packaging pipeline.

## Reproducibility

Release artifacts must be generated from a clean checkout with `pnpm install --frozen-lockfile` followed by `pnpm validate`.
