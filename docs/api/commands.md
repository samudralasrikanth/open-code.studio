# Command Registry Specifications

This document defines the commands registered in the Open-Code.Studio command registry.

---

## 1. Global Command Registry

### Editor Commands

- **`editor.open`**
  - **Description:** Opens a file in the active editor group.
  - **Arguments:** `{ uri: string; pinned?: boolean }`
- **`editor.close`**
  - **Description:** Closes the target editor input.
  - **Arguments:** `{ inputId: string; groupId: string }`
- **`editor.splitRight`**
  - **Description:** Splits the active editor group horizontally.
  - **Arguments:** `None`
- **`editor.splitDown`**
  - **Description:** Splits the active editor group vertically.
  - **Arguments:** `None`

### Terminal Commands

- **`terminal.new`**
  - **Description:** Spawns a new PTY session tab.
  - **Arguments:** `{ shellPath?: string; Cwd?: string }`
- **`terminal.kill`**
  - **Description:** Kills the target PTY shell process.
  - **Arguments:** `{ sessionId: string }`

### Workspace Commands

- **`workspace.save`**
  - **Description:** Saves the active dirty document buffer.
  - **Arguments:** `None`
- **`workspace.search`**
  - **Description:** Triggers ripgrep multi-file search.
  - **Arguments:** `{ query: string }`
