# Security Architecture

> Version: 1.0

## Principles

- Zero Trust
- Least Privilege
- Defense in Depth
- Secure Defaults

## Trust Boundaries

- Renderer ↔ Main
- Main ↔ Extension Host
- IDE ↔ AI Providers
- IDE ↔ Network

## Controls

- IPC validation
- Path validation
- Secret storage
- Permission checks
- Audit logging
- Input sanitization

## Threats

- Prompt injection
- Malicious extensions
- Directory traversal
- Credential leakage
- Supply-chain attacks

## Mitigations

Schema validation, signed extensions, sandboxing, CSP, capability-based permissions and encrypted secret storage.

## Summary

Security is a cross-cutting concern implemented through layered controls rather than a single subsystem.
