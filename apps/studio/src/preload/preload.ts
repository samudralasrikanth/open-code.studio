/* eslint-disable */
import { electronAPI } from "@electron-toolkit/preload";
import type { VisibleNode } from "@ocs/explorer";
import type { Workspace, RecentWorkspace } from "@ocs/workspace";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from "electron";

import { IpcChannels } from "../shared/ipc-channels.js";

// Lightweight flow logging for the preload bridge (no access to full Logger)
let _flowCounter = 0;
function flowLog(
  domain: string,
  source: string,
  action: string,
  context?: Record<string, unknown>
): void {
  const cid = `${domain}-${Date.now().toString(36)}-${(++_flowCounter).toString(36)}`;
  console.info(`[flow:${domain}] ${source}: ${action}`, { ...context, correlationId: cid });
}

/**
 * The OCS API exposed to the renderer process via contextBridge.
 *
 * The renderer MUST NOT use any Node.js API directly. All communication with
 * the main process goes through this typed API object.
 */
const ocsAPI = {
  // ── Health & diagnostics ────────────────────────────────────────────────────
  health: {
    check: (): Promise<{ status: string; version: string; timestamp: string }> =>
      ipcRenderer.invoke(IpcChannels.HEALTH_CHECK),

    platformInfo: (): Promise<{
      platform: string;
      arch: string;
      nodeVersion: string;
      electronVersion: string;
      appVersion: string;
    }> => ipcRenderer.invoke(IpcChannels.PLATFORM_INFO)
  },

  // ── Theme ───────────────────────────────────────────────────────────────────
  theme: {
    get: (): Promise<"dark" | "light" | "system"> => ipcRenderer.invoke(IpcChannels.THEME_GET),

    set: (theme: "dark" | "light" | "system"): Promise<boolean> =>
      ipcRenderer.invoke(IpcChannels.THEME_SET, theme),

    onChange: (callback: (theme: "dark" | "light" | "system") => void): (() => void) => {
      const handler = (_: Electron.IpcRendererEvent, theme: "dark" | "light" | "system"): void => {
        callback(theme);
      };
      ipcRenderer.on(IpcChannels.THEME_CHANGED, handler);
      return () => ipcRenderer.off(IpcChannels.THEME_CHANGED, handler);
    }
  },

  // ── Window controls ─────────────────────────────────────────────────────────
  window: {
    minimize: (): void => {
      ipcRenderer.send(IpcChannels.APP_MINIMIZE);
    },
    toggleMaximize: (): void => {
      ipcRenderer.send(IpcChannels.APP_TOGGLE_MAXIMIZE);
    },
    close: (): void => {
      ipcRenderer.send(IpcChannels.APP_QUIT);
    },
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke(IpcChannels.APP_IS_MAXIMIZED)
  },

  // ── Workspace ───────────────────────────────────────────────────────────────
  workspace: {
    openFolderDialog: async (): Promise<{ canceled: boolean; folderPath: string | null }> => {
      flowLog("workspace", "preload", "open-folder-dialog:invoke");
      const result = await ipcRenderer.invoke(IpcChannels.WORKSPACE_OPEN_FOLDER_DIALOG);
      flowLog("workspace", "preload", "open-folder-dialog:resolved", result);
      return result;
    },

    open: async (path: string): Promise<Workspace | null> => {
      flowLog("workspace", "preload", "workspace-open:invoke", { path });
      const workspace = await ipcRenderer.invoke(IpcChannels.WORKSPACE_OPEN, path);
      flowLog("workspace", "preload", "workspace-open:resolved", {
        workspaceId: workspace?.id,
        workspaceUri: workspace?.uri
      });
      return workspace;
    },

    close: (): Promise<void> => ipcRenderer.invoke(IpcChannels.WORKSPACE_CLOSE),

    getActive: (): Promise<Workspace | null> =>
      ipcRenderer.invoke(IpcChannels.WORKSPACE_GET_ACTIVE),

    getRecent: (): Promise<readonly RecentWorkspace[]> =>
      ipcRenderer.invoke(IpcChannels.WORKSPACE_GET_RECENT),

    getLastOpened: (): Promise<string | null> =>
      ipcRenderer.invoke(IpcChannels.WORKSPACE_GET_LAST_OPENED),

    removeRecent: (id: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.WORKSPACE_REMOVE_RECENT, id),

    updateSettings: (settings: Record<string, unknown>): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.WORKSPACE_UPDATE_SETTINGS, settings)
  },

  // ── Explorer ────────────────────────────────────────────────────────────────
  explorer: {
    getVisibleNodes: (): Promise<VisibleNode[]> =>
      ipcRenderer.invoke(IpcChannels.EXPLORER_GET_VISIBLE_NODES),

    getStats: (): Promise<{
      visibleNodes: number;
      totalNodes: number;
      expandedCount: number;
      selectedNodeIds: readonly string[];
    }> => ipcRenderer.invoke(IpcChannels.EXPLORER_GET_STATS),

    expandNode: (providerId: string, nodeId: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.EXPLORER_EXPAND_NODE, providerId, nodeId),

    collapseNode: (nodeId: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.EXPLORER_COLLAPSE_NODE, nodeId),

    selectNode: (nodeId: string, multi: boolean = false): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.EXPLORER_SELECT_NODE, nodeId, multi),

    executeCommand: (
      commandId: string,
      args?: { uri?: string; targetUri?: string; isDirectory?: boolean }
    ): Promise<void> => ipcRenderer.invoke(IpcChannels.EXPLORER_EXECUTE_COMMAND, commandId, args),

    revealInFinder: (uri: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.EXPLORER_REVEAL_IN_FINDER, uri),

    onStateChanged: (callback: () => void): (() => void) => {
      const handler = () => callback();
      ipcRenderer.on(IpcChannels.EXPLORER_STATE_CHANGED, handler);
      return () => ipcRenderer.off(IpcChannels.EXPLORER_STATE_CHANGED, handler);
    }
  },

  // ── Document ────────────────────────────────────────────────────────────────
  document: {
    open: (uri: string): Promise<any> => ipcRenderer.invoke(IpcChannels.DOCUMENT_OPEN, uri),
    close: (uri: string): Promise<void> => ipcRenderer.invoke(IpcChannels.DOCUMENT_CLOSE, uri),
    save: (uri: string): Promise<void> => ipcRenderer.invoke(IpcChannels.DOCUMENT_SAVE, uri),
    get: (uri: string): Promise<any> => ipcRenderer.invoke(IpcChannels.DOCUMENT_GET, uri),
    update: (uri: string, content: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.DOCUMENT_UPDATE, uri, content),
    revert: (uri: string): Promise<void> => ipcRenderer.invoke(IpcChannels.DOCUMENT_REVERT, uri),
    onStateChanged: (callback: (payload: any) => void): (() => void) => {
      const handler = (_: any, payload: any) => callback(payload);
      ipcRenderer.on(IpcChannels.DOCUMENT_STATE_CHANGED, handler);
      return () => ipcRenderer.off(IpcChannels.DOCUMENT_STATE_CHANGED, handler);
    }
  },

  // ── Editor ──────────────────────────────────────────────────────────────────
  editor: {
    open: (input: any, options?: any): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.EDITOR_OPEN, input, options),
    close: (input: any, groupId?: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.EDITOR_CLOSE, input, groupId),
    getState: (): Promise<any> => ipcRenderer.invoke(IpcChannels.EDITOR_GET_STATE),
    onStateChanged: (callback: (payload: any) => void): (() => void) => {
      const handler = (_: any, payload: any) => callback(payload);
      ipcRenderer.on(IpcChannels.EDITOR_STATE_CHANGED, handler);
      return () => ipcRenderer.off(IpcChannels.EDITOR_STATE_CHANGED, handler);
    }
  },

  // ── Diagnostics ─────────────────────────────────────────────────────────────
  diagnostics: {
    get: (): Promise<{
      desktop: boolean;
      workspace: boolean;
      explorer: boolean;
      fileWatcher: boolean;
      eventBus: boolean;
      logger: boolean;
      ipc: boolean;
      visibleNodes: number;
      expandedCount: number;
      totalNodes: number;
    }> => ipcRenderer.invoke(IpcChannels.DIAGNOSTICS_GET)
  },

  // ── Commands ────────────────────────────────────────────────────────────────
  commands: {
    execute: (commandId: string, args?: any): Promise<any> =>
      ipcRenderer.invoke(IpcChannels.COMMAND_EXECUTE, commandId, args)
  }
};

// Expose the typed API to the renderer under window.electronAPI and window.ocs
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("ocs", ocsAPI);
  } catch (error) {
    console.error("Failed to expose contextBridge API:", error);
  }
}

export type OcsAPI = typeof ocsAPI;
