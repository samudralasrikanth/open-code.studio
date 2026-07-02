/**
 * Typed IPC channel names shared between the main process and the renderer.
 *
 * Both sides import from this file so that channel strings never go out of
 * sync. Changing a channel name here is a single-file change.
 */
export const IpcChannels = {
  // Health & diagnostics
  HEALTH_CHECK: "health:check",
  PLATFORM_INFO: "platform:info",

  // Theme management
  THEME_GET: "theme:get",
  THEME_SET: "theme:set",
  THEME_CHANGED: "theme:changed", // main → renderer push event

  // Application lifecycle
  APP_QUIT: "app:quit",
  APP_MINIMIZE: "app:minimize",
  APP_MAXIMIZE: "app:maximize",
  APP_TOGGLE_MAXIMIZE: "app:toggle-maximize",
  APP_IS_MAXIMIZED: "app:is-maximized",

  // Workspace
  WORKSPACE_OPEN_FOLDER_DIALOG: "workspace:open-folder-dialog",
  WORKSPACE_OPEN: "workspace:open",
  WORKSPACE_CLOSE: "workspace:close",
  WORKSPACE_GET_ACTIVE: "workspace:get-active",
  WORKSPACE_GET_RECENT: "workspace:get-recent",
  WORKSPACE_REMOVE_RECENT: "workspace:remove-recent",

  // Explorer
  EXPLORER_GET_VISIBLE_NODES: "explorer:get-visible-nodes",
  EXPLORER_EXPAND_NODE: "explorer:expand-node",
  EXPLORER_COLLAPSE_NODE: "explorer:collapse-node",
  EXPLORER_SELECT_NODE: "explorer:select-node",
  EXPLORER_EXECUTE_COMMAND: "explorer:execute-command",
  EXPLORER_STATE_CHANGED: "explorer:state-changed" // main → renderer push event
} as const;

export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels];
