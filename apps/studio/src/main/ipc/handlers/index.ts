/* eslint-disable */
import type { Container } from "@ocs/common";
import { registerHealthHandlers } from "./health/index.js";
import { registerWorkspaceHandlers, restoreLastWorkspace } from "./workspace/index.js";
import { registerExplorerHandlers } from "./explorer/index.js";
import { registerDocumentHandlers } from "./document/index.js";
import { registerEditorHandlers } from "./editor/index.js";
import { registerCommandHandlers } from "./commands/index.js";
import { registerTerminalHandlers } from "./terminal/index.js";

/**
 * Register all IPC handlers for the main process.
 */
export function registerIpcHandlers(container: Container): void {
  registerHealthHandlers(container);
  registerWorkspaceHandlers(container);
  registerExplorerHandlers(container);
  registerDocumentHandlers(container);
  registerEditorHandlers(container);
  registerCommandHandlers(container);
  registerTerminalHandlers(container);
}

export { restoreLastWorkspace };
