/* eslint-disable */
import type { Container } from "@ocs/common";
import type { IpcMainInvokeEvent } from "electron";
import { ipcMain } from "electron";

import { IpcChannels } from "../../shared/ipc-channels.js";

/**
 * Register all IPC handlers for the main process.
 *
 * Handlers are defined here and communicate with the renderer only through
 * the typed channels declared in shared/ipc-channels.ts.
 */
export function registerIpcHandlers(container: Container): void {
  // ── Health ─────────────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.HEALTH_CHECK, async (_event: IpcMainInvokeEvent) => {
    return {
      status: "ok",
      version: process.versions.electron,
      timestamp: new Date().toISOString()
    };
  });

  // ── Theme ──────────────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.THEME_GET, async () => {
    // Theme persistence will be wired to config service; return default for now
    return "dark";
  });

  ipcMain.handle(IpcChannels.THEME_SET, async (_event, theme: "dark" | "light" | "system") => {
    const { nativeTheme } = await import("electron");
    nativeTheme.themeSource = theme === "system" ? "system" : theme;
    return true;
  });

  // ── Platform Info ──────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.PLATFORM_INFO, async () => {
    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.versions.node,
      electronVersion: process.versions.electron,
      appVersion: (await import("electron")).app.getVersion()
    };
  });

  // ── Workspace ──────────────────────────────────────────────────────────────
  const workspaceService = container.resolve<import("@ocs/workspace").WorkspaceService>(
    Symbol.for("workspace")
  );
  type Workspace = import("@ocs/workspace").Workspace;

  ipcMain.handle(IpcChannels.WORKSPACE_OPEN_FOLDER_DIALOG, async () => {
    const { dialog } = await import("electron");
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"]
    });
    return { canceled, folderPath: canceled ? null : filePaths[0] };
  });

  ipcMain.handle(IpcChannels.WORKSPACE_OPEN, async (_, path: string): Promise<Workspace | null> => {
    const workspace = await workspaceService.open(path);
    if (workspace) {
      // Find the workspace provider and set its root
      const provider = (explorerService as any).providers.get("explorer.provider.workspace");
      if (provider) {
        provider.setRoot(workspace.uri);
        await explorerService.refresh("explorer.provider.workspace", null);
      }
    }
    return workspace;
  });

  ipcMain.handle(IpcChannels.WORKSPACE_CLOSE, async () => {
    return workspaceService.close();
  });

  ipcMain.handle(IpcChannels.WORKSPACE_GET_ACTIVE, () => {
    return workspaceService.getActive();
  });

  ipcMain.handle(IpcChannels.WORKSPACE_GET_RECENT, () => {
    return workspaceService.getRecent();
  });

  ipcMain.handle(IpcChannels.WORKSPACE_REMOVE_RECENT, async (_, id: string): Promise<void> => {
    return workspaceService.removeRecent(id);
  });

  // ── Explorer ───────────────────────────────────────────────────────────────
  const explorerService = container.resolve<import("@ocs/explorer").ExplorerService>(
    Symbol.for("explorer")
  );

  ipcMain.handle(IpcChannels.EXPLORER_GET_VISIBLE_NODES, () => {
    return explorerService.treeModel.getVisibleNodes();
  });

  ipcMain.handle(
    IpcChannels.EXPLORER_EXPAND_NODE,
    async (_, providerId: string, nodeId: string) => {
      await explorerService.expandNode(providerId, nodeId);
    }
  );

  ipcMain.handle(IpcChannels.EXPLORER_COLLAPSE_NODE, (_, nodeId: string) => {
    explorerService.collapseNode(nodeId);
  });

  ipcMain.handle(IpcChannels.EXPLORER_SELECT_NODE, (_, nodeId: string, multi: boolean) => {
    explorerService.selectNode(nodeId, multi);
  });

  // Wire up state change events to push to renderer
  // We need the windowManager to push events to the main window.
  // For now we can use webContents.getAllWebContents() to broadcast.
  const { webContents } = require("electron");
  explorerService.eventBus.on("explorer.refreshCompleted", () => {
    webContents.getAllWebContents().forEach((wc) => {
      wc.send(IpcChannels.EXPLORER_STATE_CHANGED);
    });
  });
  explorerService.eventBus.on("explorer.nodeExpanded", () => {
    webContents.getAllWebContents().forEach((wc) => {
      wc.send(IpcChannels.EXPLORER_STATE_CHANGED);
    });
  });
  explorerService.eventBus.on("explorer.nodeCollapsed", () => {
    webContents.getAllWebContents().forEach((wc) => {
      wc.send(IpcChannels.EXPLORER_STATE_CHANGED);
    });
  });
  explorerService.eventBus.on("explorer.selectionChanged", () => {
    webContents.getAllWebContents().forEach((wc) => {
      wc.send(IpcChannels.EXPLORER_STATE_CHANGED);
    });
  });

  // ── Document ───────────────────────────────────────────────────────────────
  const documentService = container.resolve<import("@ocs/document").DocumentService>(
    Symbol.for("document")
  );

  const { uriFromString } = require("@ocs/workspace");

  ipcMain.handle(IpcChannels.DOCUMENT_OPEN, async (_, uriStr: string) => {
    const uri = uriFromString(uriStr);
    const doc = await documentService.openDocument(uri);
    return {
      uri: doc.uri.toString(),
      type: doc.type,
      isDirty: doc.isDirty,
      isReadonly: doc.isReadonly,
      content: doc.type === "text" ? (doc as import("@ocs/document").ITextDocument).getText() : null
    };
  });

  ipcMain.handle(IpcChannels.DOCUMENT_CLOSE, async (_, uriStr: string) => {
    const uri = uriFromString(uriStr);
    documentService.closeDocument(uri);
  });

  ipcMain.handle(IpcChannels.DOCUMENT_SAVE, async (_, uriStr: string) => {
    const uri = uriFromString(uriStr);
    await documentService.saveDocument(uri);
  });

  ipcMain.handle(IpcChannels.DOCUMENT_GET, async (_, uriStr: string) => {
    const uri = uriFromString(uriStr);
    // Ideally DocumentRegistry exposes a get method, DocumentCache has one
    // We would use `DocumentCache.get` or keep track of open documents.
    // For now we can just open it again since it retrieves from cache.
    const doc = await documentService.openDocument(uri);
    return {
      uri: doc.uri.toString(),
      type: doc.type,
      isDirty: doc.isDirty,
      isReadonly: doc.isReadonly,
      content: doc.type === "text" ? (doc as import("@ocs/document").ITextDocument).getText() : null
    };
  });

  // ── Editor ─────────────────────────────────────────────────────────────────
  const editorService = container.resolve<import("@ocs/editor").EditorService>(
    Symbol.for("editor")
  );

  ipcMain.handle(IpcChannels.EDITOR_OPEN, async (_, inputStr: string, options?: any) => {
    // For now, assume inputStr is a URI and wrap it in DocumentEditorInput
    const uri = uriFromString(inputStr);
    const doc = await documentService.openDocument(uri);
    const { DocumentEditorInput } = require("@ocs/editor");
    editorService.openEditor(new DocumentEditorInput(doc), options);
  });

  ipcMain.handle(IpcChannels.EDITOR_CLOSE, async (_, inputStr: string, groupId?: string) => {
    // Basic implementation for now
    const uri = uriFromString(inputStr);
    const group = groupId ? editorService.groups.find((g: any) => g.id === groupId) : undefined;

    const performClose = async (input: any, g: any) => {
      if (input.isDirty()) {
        const { dialog } = await import("electron");
        const result = await dialog.showMessageBox({
          type: "warning",
          buttons: ["Save", "Don't Save", "Cancel"],
          title: "Save changes?",
          message: `Do you want to save the changes you made to ${input.getName()}?`,
          detail: "Your changes will be lost if you don't save them.",
          cancelId: 2
        });

        if (result.response === 0) {
          // Save
          await documentService.saveDocument(uri);
        } else if (result.response === 2) {
          // Cancel
          return;
        }
        // If "Don't Save" (1), just proceed to close.
      }
      editorService.closeEditor(input, g);
    };

    // Find the input in the group
    if (group) {
      const input = group.inputs.find((i: any) => i.id === uri.toString());
      if (input) await performClose(input, group);
    } else {
      for (const g of editorService.groups) {
        const input = (g as any).inputs.find((i: any) => i.id === uri.toString());
        if (input) await performClose(input, g);
      }
    }
  });

  ipcMain.handle(IpcChannels.EDITOR_GET_STATE, () => {
    return {
      groups: editorService.groups.map((g: any) => ({
        id: g.id,
        inputs: g.inputs.map((i: any) => i.id),
        activeInput: g.activeInput?.id,
        previewInput: g.previewInput?.id
      })),
      activeGroup: editorService.activeGroup?.id
    };
  });

  const broadcastEditorState = () => {
    webContents.getAllWebContents().forEach((wc) => {
      wc.send(IpcChannels.EDITOR_STATE_CHANGED, {
        groups: editorService.groups.map((g: any) => ({
          id: g.id,
          inputs: g.inputs.map((i: any) => i.id),
          activeInput: g.activeInput?.id,
          previewInput: g.previewInput?.id
        })),
        activeGroup: editorService.activeGroup?.id
      });
    });
  };

  editorService.eventBus.on("editor.opened", broadcastEditorState);
  editorService.eventBus.on("editor.closed", broadcastEditorState);
  editorService.eventBus.on("editor.activeChanged", broadcastEditorState);

  // ── Commands ───────────────────────────────────────────────────────────────
  const commandRegistry = container.resolve<import("@ocs/common").CommandRegistry>(
    Symbol.for("commands")
  );

  ipcMain.handle(IpcChannels.COMMAND_EXECUTE, async (_, commandId: string, args: any) => {
    // If command is save document, we need to convert uri string to WorkspaceUri
    if (commandId === "document.save" && args?.uri) {
      args.uri = uriFromString(args.uri);
    }
    return commandRegistry.executeCommand(commandId, args);
  });
}
