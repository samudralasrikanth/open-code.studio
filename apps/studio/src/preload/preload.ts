/* eslint-disable */
import { electronAPI } from "@electron-toolkit/preload";
import type { VisibleNode } from "@ocs/explorer";
import type { Workspace, RecentWorkspace } from "@ocs/workspace";
import type { Theme } from "@ocs/theme";
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
    get: (): Promise<{
      activeId: string;
      theme: Theme;
      all: Array<{ id: string; name: string; type: "dark" | "light" | "hc" }>;
    }> => ipcRenderer.invoke(IpcChannels.THEME_GET),

    set: (themeId: string): Promise<Theme> => ipcRenderer.invoke(IpcChannels.THEME_SET, themeId),

    onChange: (callback: (data: { themeId: string }) => void): (() => void) => {
      const handler = (_: Electron.IpcRendererEvent, data: { themeId: string }): void => {
        callback(data);
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

    getAllFiles: (): Promise<string[]> => ipcRenderer.invoke(IpcChannels.WORKSPACE_GET_ALL_FILES),

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
    search: (query: string, limit?: number): Promise<any[]> =>
      ipcRenderer.invoke(IpcChannels.COMMANDS_SEARCH, query, limit),
    execute: (commandId: string, args?: any): Promise<any> =>
      ipcRenderer.invoke(IpcChannels.COMMANDS_EXECUTE, commandId, args),
    getHistory: (): Promise<string[]> => ipcRenderer.invoke(IpcChannels.COMMANDS_GET_HISTORY)
  },

  // ── Terminal ────────────────────────────────────────────────────────────────
  terminal: {
    create: (options: {
      shell?: string;
      args?: string[];
      cwd: string;
      cols?: number;
      rows?: number;
    }): Promise<any> => ipcRenderer.invoke(IpcChannels.TERMINAL_CREATE, options),
    close: (id: string): Promise<void> => ipcRenderer.invoke(IpcChannels.TERMINAL_CLOSE, id),
    resize: (id: string, cols: number, rows: number): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.TERMINAL_RESIZE, id, cols, rows),
    sendText: (id: string, text: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.TERMINAL_INPUT, id, text),
    list: (): Promise<any[]> => ipcRenderer.invoke(IpcChannels.TERMINAL_LIST),
    onOutput: (callback: (payload: { id: string; data: string }) => void): (() => void) => {
      const handler = (_: any, payload: { id: string; data: string }) => callback(payload);
      ipcRenderer.on(IpcChannels.TERMINAL_OUTPUT, handler);
      return () => ipcRenderer.off(IpcChannels.TERMINAL_OUTPUT, handler);
    },
    onExit: (callback: (payload: { id: string; exitCode?: number }) => void): (() => void) => {
      const handler = (_: any, payload: { id: string; exitCode?: number }) => callback(payload);
      ipcRenderer.on(IpcChannels.TERMINAL_EXIT, handler);
      return () => ipcRenderer.off(IpcChannels.TERMINAL_EXIT, handler);
    }
  },

  // ── Git ───────────────────────────────────────────────────────────────────
  git: {
    status: (): Promise<any> => ipcRenderer.invoke(IpcChannels.GIT_STATUS),
    commit: (message: string): Promise<void> => ipcRenderer.invoke(IpcChannels.GIT_COMMIT, message),
    pull: (): Promise<void> => ipcRenderer.invoke(IpcChannels.GIT_PULL),
    push: (): Promise<void> => ipcRenderer.invoke(IpcChannels.GIT_PUSH),
    history: (filePath?: string): Promise<any[]> =>
      ipcRenderer.invoke(IpcChannels.GIT_HISTORY, filePath)
  },

  // ── Search ────────────────────────────────────────────────────────────────
  search: {
    start: (query: any, cwd: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.SEARCH_START, query, cwd),
    cancel: (queryId: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.SEARCH_CANCEL, queryId),
    replace: (operation: any): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.SEARCH_REPLACE, operation),
    onResultFound: (callback: (payload: any) => void): (() => void) => {
      const handler = (_: any, payload: any) => callback(payload);
      ipcRenderer.on(IpcChannels.SEARCH_RESULT_FOUND, handler);
      return () => ipcRenderer.off(IpcChannels.SEARCH_RESULT_FOUND, handler);
    },
    onProgress: (callback: (payload: any) => void): (() => void) => {
      const handler = (_: any, payload: any) => callback(payload);
      ipcRenderer.on(IpcChannels.SEARCH_PROGRESS, handler);
      return () => ipcRenderer.off(IpcChannels.SEARCH_PROGRESS, handler);
    },
    onCompleted: (callback: (payload: any) => void): (() => void) => {
      const handler = (_: any, payload: any) => callback(payload);
      ipcRenderer.on(IpcChannels.SEARCH_COMPLETED, handler);
      return () => ipcRenderer.off(IpcChannels.SEARCH_COMPLETED, handler);
    },
    onCancelled: (callback: (payload: any) => void): (() => void) => {
      const handler = (_: any, payload: any) => callback(payload);
      ipcRenderer.on(IpcChannels.SEARCH_CANCELLED, handler);
      return () => ipcRenderer.off(IpcChannels.SEARCH_CANCELLED, handler);
    }
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  settings: {
    get: (id: string): Promise<any> => ipcRenderer.invoke(IpcChannels.SETTINGS_GET, id),
    getAll: (): Promise<Record<string, any>> => ipcRenderer.invoke(IpcChannels.SETTINGS_GET_ALL),
    set: (id: string, value: any, scope: "user" | "workspace"): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.SETTINGS_SET, id, value, scope),
    reset: (id: string, scope: "user" | "workspace"): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.SETTINGS_RESET, id, scope),
    onChanged: (
      callback: (payload: { id: string; value: any; scope: string }) => void
    ): (() => void) => {
      const handler = (_: any, payload: any) => callback(payload);
      ipcRenderer.on(IpcChannels.SETTINGS_CHANGED, handler);
      return () => ipcRenderer.off(IpcChannels.SETTINGS_CHANGED, handler);
    }
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  notifications: {
    create: (opt: any): Promise<string> =>
      ipcRenderer.invoke(IpcChannels.NOTIFICATIONS_CREATE, opt),
    update: (id: string, updates: any): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.NOTIFICATIONS_UPDATE, id, updates),
    dismiss: (id: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.NOTIFICATIONS_DISMISS, id),
    clear: (): Promise<void> => ipcRenderer.invoke(IpcChannels.NOTIFICATIONS_CLEAR),
    getActive: (): Promise<any[]> => ipcRenderer.invoke(IpcChannels.NOTIFICATIONS_GET_ACTIVE),
    getHistory: (): Promise<any[]> => ipcRenderer.invoke(IpcChannels.NOTIFICATIONS_GET_HISTORY),
    onChanged: (callback: (payload: { eventType: string; payload: any }) => void): (() => void) => {
      const handler = (_: any, payload: any) => callback(payload);
      ipcRenderer.on(IpcChannels.NOTIFICATIONS_CHANGED, handler);
      return () => ipcRenderer.off(IpcChannels.NOTIFICATIONS_CHANGED, handler);
    }
  },

  // ── Keybindings ────────────────────────────────────────────────────────────
  keybindings: {
    get: (): Promise<any[]> => ipcRenderer.invoke(IpcChannels.KEYBINDINGS_GET),
    set: (binding: any): Promise<any[]> => ipcRenderer.invoke(IpcChannels.KEYBINDINGS_SET, binding)
  },

  // ── Session ─────────────────────────────────────────────────────────────────
  session: {
    load: (workspaceId: string): Promise<any> =>
      ipcRenderer.invoke(IpcChannels.SESSION_LOAD, workspaceId),
    save: (snapshot: any, immediate?: boolean): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.SESSION_SAVE, snapshot, immediate),
    onChanged: (callback: (snapshot: any) => void): (() => void) => {
      const handler = (_: any, snapshot: any) => callback(snapshot);
      ipcRenderer.on(IpcChannels.SESSION_CHANGED, handler);
      return () => ipcRenderer.off(IpcChannels.SESSION_CHANGED, handler);
    }
  },

  // ── Extensions ──────────────────────────────────────────────────────────────
  extensions: {
    search: (query: any): Promise<{ success: boolean; data?: any; error?: any }> =>
      ipcRenderer.invoke(IpcChannels.EXTENSIONS_SEARCH, query),
    install: (id: string): Promise<any> => ipcRenderer.invoke(IpcChannels.EXTENSIONS_INSTALL, id),
    getDetails: (id: string): Promise<{ success: boolean; data?: any; error?: any }> =>
      ipcRenderer.invoke(IpcChannels.EXTENSIONS_GET_DETAILS, id),
    isInstalled: (id: string): Promise<{ success: boolean; data?: boolean; error?: any }> =>
      ipcRenderer.invoke(IpcChannels.EXTENSIONS_IS_INSTALLED, id)
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
