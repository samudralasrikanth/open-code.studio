# package: @ocs/editor

This package contains the Editor Platform layout management logic, controlling multi-group viewports, tab configurations (preview vs. pinned), and editor serialization.

---

## 1. Architecture

The Editor package uses a tree-based layout model where each group is represented as a split node (`SplitNode`) that can nest recursively.

```
@ocs/editor/
├── src/
│   ├── domain/                  # Layout tree entities
│   │     ├── EditorGroup.ts
│   │     ├── EditorInput.ts
│   │     └── SplitNode.ts
│   ├── application/             # Core layout coordinators
│   │     └── EditorService.ts
│   └── components/              # Abstract layout representations
│         └── LayoutTree.ts
```

---

## 2. Public API

- `EditorService`
  - `openEditor(input: EditorInput, groupId?: string): Promise<void>`
  - `closeEditor(input: EditorInput, groupId?: string): Promise<void>`
  - `splitGroup(groupId: string, direction: "horizontal" | "vertical"): string`
  - `serializeLayout(): SerializedLayout`
  - `restoreLayout(layout: SerializedLayout): Promise<void>`

---

## 3. Internal API

- `SplitNode`: Tree structures mapping layout child nodes.
- `ActiveEditorTracker`: Internal focus listener monitoring editor view state.

---

## 4. Dependencies

- `@ocs/common` (Leaf utilities)
- `@ocs/event-bus` (Event coordination)
- `@ocs/document` (To map open text files)

---

## 5. Import Rules

- **Allowed Imports:** `@ocs/common`, `@ocs/event-bus`, `@ocs/document`.
- **Forbidden Imports:** Monaco-specific engines (`@ocs/editor-monaco` - Monaco must adapt to editor interface, not vice-versa) or UI visual libraries.

---

## 6. Lifecycle

- Initialized on main workspace mount. Layout nodes are restored from local session state dynamically.

---

## 7. Testing

- Mock editor input instances are used to test tab pinning and split viewport insertions.
- Run tests via `pnpm test`.

---

## 8. Example Usage

```typescript
import { EditorService, DocumentEditorInput } from "@ocs/editor";
import { container } from "@ocs/common";

const editorService = container.resolve<IEditorService>("IEditorService");
const input = new DocumentEditorInput(fileUri);
await editorService.openEditor(input);
```
