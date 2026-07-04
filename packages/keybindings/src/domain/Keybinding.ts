export interface Keybinding {
  readonly key: string;          // e.g. "Ctrl+S" or "Ctrl+K Ctrl+C"
  readonly command: string;      // e.g. "editor.save"
  readonly when?: string;        // e.g. "editorFocus"
}
