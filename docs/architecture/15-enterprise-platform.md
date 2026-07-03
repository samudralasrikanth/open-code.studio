# Enterprise Platform Architecture

> Version: 1.0

## Purpose

The Enterprise Platform adds organization-scale capabilities on top of the core IDE without changing feature implementations.

## Capabilities

- Organizations
- SSO/OIDC/SAML
- RBAC
- Policy enforcement
- Audit logging
- License management
- Centralized configuration
- Secret management

## Architecture

```text
Enterprise UI
      |
Enterprise Services
 |   |   |
Auth Policy Audit
      |
Platform Services
```

## Core Services

### Identity

Supports local accounts, OAuth, OIDC and SAML.

### Authorization

Role-based access control with organization, workspace and resource scopes.

### Policy Engine

Evaluates extension, AI, filesystem and security policies before privileged operations.

### Audit Service

Records security-sensitive operations with immutable timestamps.

### Configuration

Supports organization, team, workspace and user policy hierarchy.

## Security

Least privilege, encrypted secrets, signed sessions, policy validation.

## Related

- 03-platform-layer.md
- 16-security.md

## Summary

Enterprise capabilities are layered above the core platform through independent services and policy enforcement.
