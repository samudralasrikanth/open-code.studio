# Configuration Service

The configuration service validates immutable startup configuration and supports explicit reloads for values that are allowed to change at runtime.

## Public API

- `ConfigurationService`
- `parseJsonConfig`
- `parseYamlConfig`
- `loadEnvironmentConfig`
- `secret`

Configuration reloads publish `configuration.changed` when an event bus is provided.
