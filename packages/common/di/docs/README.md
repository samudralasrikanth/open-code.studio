# Dependency Injection

The DI container registers services by typed tokens and resolves them through singleton or transient lifecycles.

## Public API

- `createServiceToken`
- `createContainer`
- `Container`

Circular dependencies and unknown services throw `PlatformError` with descriptive codes.
