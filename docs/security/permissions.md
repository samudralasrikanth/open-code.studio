# Security: Permission Model

This document defines the permission verification model used to secure file system and terminal accesses in Open-Code.Studio.

---

## 1. Trust Boundaries

Workspace execution enforces three distinct trust levels:

1. **Untrusted Workspace:**
   - Appears when opening folders outside the user-configured "Trusted Directories" list.
   - **Restricted Operations:**
     - Spawning local terminals or executing tasks (`EPIC-0007`) is disabled.
     - Loading extension plugins (`EPIC-0072`) is blocked.
     - Spawning AI agents (`EPIC-0049`) is blocked.
     - Ripgrep multi-file search runs in read-only sandboxed mode.

2. **Trusted Workspace:**
   - Appears when the user explicitly clicks "Trust this Workspace" or mounts a trusted path.
   - **Allowed Operations:**
     - Spawn local terminals, run Git commit commands, load authorized workspace plugins.

---

## 2. File System Access Verification

Every read/write operation resolved through `IWorkspaceService` must run through a validation check:

```typescript
export function verifyPathAccess(uri: WorkspaceUri, root: WorkspaceUri): void {
  const absolutePath = path.resolve(uri.fsPath);
  const absoluteRoot = path.resolve(root.fsPath);

  if (!absolutePath.startsWith(absoluteRoot)) {
    throw new AccessDeniedError(
      `Access denied: path ${absolutePath} is outside workspace root ${absoluteRoot}`
    );
  }
}
```

If this check fails, the operation is terminated and recorded in the audit logs.
