/* eslint-disable */
import type { Container } from "@ocs/common";
import { Logger } from "@ocs/common";
import { ipcMain } from "electron";
import { uriFromPath } from "@ocs/workspace";
import { IpcChannels } from "../../../../shared/ipc-channels.js";
import { setupWorkspaceExplorer, teardownWorkspaceExplorer } from "../explorer/index.js";

export function registerWorkspaceHandlers(container: Container): void {
  const workspaceService = container.resolve<import("@ocs/workspace/application").WorkspaceService>(
    Symbol.for("workspace")
  );
  const logger = container.resolve<Logger>(Symbol.for("logger"));

  type Workspace = import("@ocs/workspace").Workspace;

  ipcMain.handle(IpcChannels.WORKSPACE_OPEN_FOLDER_DIALOG, async () => {
    const cid = Logger.correlationId("workspace");
    logger.flow({
      domain: "workspace",
      source: "main",
      action: "dialog:start",
      correlationId: cid
    });
    const { dialog } = await import("electron");
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"]
    });
    const result = { canceled, folderPath: canceled ? null : filePaths[0] };
    logger.flow({
      domain: "workspace",
      source: "main",
      action: "dialog:done",
      correlationId: cid,
      context: result
    });
    return result;
  });

  ipcMain.handle(IpcChannels.WORKSPACE_OPEN, async (_, path: string): Promise<Workspace | null> => {
    const cid = Logger.correlationId("workspace");
    logger.flow({
      domain: "workspace",
      source: "main",
      action: "open:start",
      correlationId: cid,
      context: { path }
    });

    if (workspaceService.isOpen()) {
      const current = workspaceService.getActive();
      const targetUri = uriFromPath(path);
      if (current?.uri === targetUri) {
        logger.flow({
          domain: "workspace",
          source: "main",
          action: "open:already-open",
          correlationId: cid,
          context: { workspaceId: current.id, workspaceUri: current.uri }
        });
        return current;
      }

      await teardownWorkspaceExplorer(container, logger, cid);

      logger.flow({
        domain: "workspace",
        source: "main",
        action: "open:close-current:start",
        correlationId: cid
      });
      await workspaceService.close();
      logger.flow({
        domain: "workspace",
        source: "main",
        action: "open:close-current:done",
        correlationId: cid
      });
    }

    logger.flow({
      domain: "workspace",
      source: "main",
      action: "service.open:start",
      correlationId: cid,
      context: { path }
    });
    const workspace = await workspaceService.open(path);
    logger.flow({
      domain: "workspace",
      source: "main",
      action: "service.open:done",
      correlationId: cid,
      context: { workspaceId: workspace.id, workspaceUri: workspace.uri }
    });
    if (workspace) {
      await setupWorkspaceExplorer(container, workspace, logger, cid);
    }

    // We get visible nodes in setupWorkspaceExplorer, so we just log done here
    logger.flow({
      domain: "workspace",
      source: "main",
      action: "open:done",
      correlationId: cid,
      context: {
        workspaceId: workspace?.id,
        workspaceUri: workspace?.uri
      }
    });
    return workspace;
  });

  ipcMain.handle(IpcChannels.WORKSPACE_CLOSE, async () => {
    await teardownWorkspaceExplorer(container, logger, Logger.correlationId("workspace"));
    return workspaceService.close();
  });

  ipcMain.handle(IpcChannels.WORKSPACE_GET_ACTIVE, () => workspaceService.getActive());

  ipcMain.handle(IpcChannels.WORKSPACE_GET_RECENT, () => workspaceService.getRecent());

  ipcMain.handle(IpcChannels.WORKSPACE_GET_LAST_OPENED, () => workspaceService.getLastOpenedUri());

  ipcMain.handle(IpcChannels.WORKSPACE_REMOVE_RECENT, async (_, id: string): Promise<void> =>
    workspaceService.removeRecent(id)
  );
}

/** Restore the last workspace on startup. */
export async function restoreLastWorkspace(container: Container): Promise<boolean> {
  const workspaceService = container.resolve<import("@ocs/workspace/application").WorkspaceService>(
    Symbol.for("workspace")
  );
  const logger = container.resolve<Logger>(Symbol.for("logger"));
  const lastUri = workspaceService.getLastOpenedUri();
  if (!lastUri) return false;

  const cid = Logger.correlationId("restore");
  logger.flow({
    domain: "workspace",
    source: "main",
    action: "restore:start",
    correlationId: cid,
    context: { lastUri }
  });

  const { uriToPath } = await import("@ocs/workspace");
  try {
    const workspace = await workspaceService.open(uriToPath(lastUri));
    if (workspace) {
      await setupWorkspaceExplorer(container, workspace, logger, cid);
      logger.flow({
        domain: "workspace",
        source: "main",
        action: "restore:done",
        correlationId: cid
      });
      return true;
    }
  } catch (error) {
    logger.warn("Failed to restore last workspace — folder may have been moved or deleted", {
      correlationId: cid,
      error
    });
  }
  return false;
}
