# package: @ocs/policy

This package manages Role-Based Access Controls (RBAC), policy evaluation rules, and workspace trust verifications.

---

## 1. Architecture

The Policy package evaluates incoming operations against user/agent identities and context keys to determine access permissions.

```
@ocs/policy/
├── src/
│   ├── domain/                  # Identity & Rule entities
│   │     ├── Rule.ts
│   │     └── UserRole.ts
│   └── application/             # Policy evaluation engines
│         ├── PolicyEngine.ts
│         └── TrustManager.ts
```

---

## 2. Public API

- `PolicyEngine`
  - `authorize(action: string, context: AuthContext): Promise<boolean>`
  - `evaluateAgentPermissions(agentId: string, operation: string): Promise<boolean>`
- `TrustManager`
  - `isWorkspaceTrusted(uri: WorkspaceUri): Promise<boolean>`

---

## 3. Internal API

- `ContextKeyEvaluator`: Evaluates key-value rule conditions (e.g. `workspaceIsTrusted == true`).
- `LocalPolicyStore`: Caches active security profiles to avoid re-evaluation overhead.

---

## 4. Dependencies

- `@ocs/common` (Leaf utilities)
- `@ocs/event-bus` (Event coordination)

---

## 5. Import Rules

- **Allowed Imports:** `@ocs/common`, `@ocs/event-bus`.
- **Forbidden Imports:** Platform execution scripts or UI rendering logic.

---

## 6. Lifecycle

- Loaded and bound to the application composition root on boot. Performs trust evaluations on workspace mount.

---

## 7. Testing

- Run tests via `pnpm test`.
- Uses mock auth contexts to verify permission rules block unauthorized access.

---

## 8. Example Usage

```typescript
import { PolicyEngine } from "@ocs/policy";
import { container } from "@ocs/common";

const policy = container.resolve<PolicyEngine>("PolicyEngine");
const authorized = await policy.authorize("file.write", { user: "developer", path: fileUri });
```
