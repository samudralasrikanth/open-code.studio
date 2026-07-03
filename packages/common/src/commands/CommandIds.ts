export const DocumentCommands = {
  SAVE: "document.save",
  REVERT: "document.revert"
} as const;

export const EditorCommands = {
  OPEN: "editor.open",
  CLOSE: "editor.close",
  PIN: "editor.pin",
  SPLIT_RIGHT: "editor.splitRight",
  SPLIT_DOWN: "editor.splitDown"
} as const;
