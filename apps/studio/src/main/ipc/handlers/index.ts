/* eslint-disable */
import type { Container } from "@ocs/common";
import { registerHealthHandlers } from "./health/index.js";
import { registerWorkspaceHandlers, restoreLastWorkspace } from "./workspace/index.js";
import { registerExplorerHandlers } from "./explorer/index.js";
import { registerDocumentHandlers } from "./document/index.js";
import { registerEditorHandlers } from "./editor/index.js";
import { registerCommandsHandlers } from "./commands/index.js";
import { registerTerminalHandlers } from "./terminal/index.js";
import { registerGitHandlers } from "./git/gitHandlers.js";
import { registerSearchHandlers } from "./search/searchHandlers.js";
import { registerSettingsHandlers } from "./settings/settingsHandlers.js";
import { registerThemeHandlers } from "./theme/themeHandlers.js";
import { registerNotificationHandlers } from "./notifications/notificationHandlers.js";
import { registerKeybindingHandlers } from "./keybindings/keybindingHandlers.js";
import { registerSessionHandlers } from "./session/sessionHandlers.js";
import { registerExtensionsHandlers } from "./extensions/index.js";

/**
 * Register all IPC handlers for the main process.
 */
export function registerIpcHandlers(container: Container): void {
  registerHealthHandlers(container);
  registerWorkspaceHandlers(container);
  registerExplorerHandlers(container);
  registerDocumentHandlers(container);
  registerEditorHandlers(container);
  registerCommandsHandlers(container);
  registerTerminalHandlers(container);
  registerGitHandlers();
  registerSearchHandlers(container);
  registerSettingsHandlers(container);
  registerThemeHandlers(container);
  registerNotificationHandlers(container);
  registerKeybindingHandlers(container);
  registerSessionHandlers(container);
  registerExtensionsHandlers(container);
}

export { restoreLastWorkspace };
