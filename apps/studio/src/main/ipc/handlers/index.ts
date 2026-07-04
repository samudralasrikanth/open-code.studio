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
  registerGitHandlers(container);
  registerSearchHandlers(container);
  registerSettingsHandlers(container);
}

export { restoreLastWorkspace };
