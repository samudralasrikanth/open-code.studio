import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IpcChannels } from '../shared/ipc-channels.js'

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
      platform: string
      arch: string
      nodeVersion: string
      electronVersion: string
      appVersion: string
    }> => ipcRenderer.invoke(IpcChannels.PLATFORM_INFO)
  },

  // ── Theme ───────────────────────────────────────────────────────────────────
  theme: {
    get: (): Promise<'dark' | 'light' | 'system'> =>
      ipcRenderer.invoke(IpcChannels.THEME_GET),

    set: (theme: 'dark' | 'light' | 'system'): Promise<boolean> =>
      ipcRenderer.invoke(IpcChannels.THEME_SET, theme),

    onChange: (callback: (theme: 'dark' | 'light' | 'system') => void): (() => void) => {
      const handler = (_: Electron.IpcRendererEvent, theme: 'dark' | 'light' | 'system'): void => {
        callback(theme)
      }
      ipcRenderer.on(IpcChannels.THEME_CHANGED, handler)
      return () => ipcRenderer.off(IpcChannels.THEME_CHANGED, handler)
    }
  },

  // ── Window controls ─────────────────────────────────────────────────────────
  window: {
    minimize: (): void => { ipcRenderer.send(IpcChannels.APP_MINIMIZE) },
    toggleMaximize: (): void => { ipcRenderer.send(IpcChannels.APP_TOGGLE_MAXIMIZE) },
    close: (): void => { ipcRenderer.send(IpcChannels.APP_QUIT) },
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke(IpcChannels.APP_IS_MAXIMIZED)
  }
}

// Expose the typed API to the renderer under window.electronAPI and window.ocs
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('ocs', ocsAPI)
  } catch (error) {
    console.error('Failed to expose contextBridge API:', error)
  }
}

export type OcsAPI = typeof ocsAPI
