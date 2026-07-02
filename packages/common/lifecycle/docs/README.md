# Lifecycle Manager

The lifecycle manager starts services in dependency order and shuts them down in reverse order. Startup failures trigger safe shutdown of services that already started.

## Public API

- `LifecycleManager`
- `LifecycleService`
- `createLifecycleManager`
