import type { IpcMainInvokeEvent } from 'electron'
import { ipcMain } from 'electron'
import type { Container } from '@ocs/common'
import { IpcChannels } from '../../shared/ipc-channels.js'

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
      status: 'ok',
      version: process.versions.electron,
      timestamp: new Date().toISOString()
    }
  })

  // ── Theme ──────────────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.THEME_GET, async () => {
    // Theme persistence will be wired to config service; return default for now
    return 'dark'
  })

  ipcMain.handle(IpcChannels.THEME_SET, async (_event, theme: 'dark' | 'light' | 'system') => {
    const { nativeTheme } = await import('electron')
    nativeTheme.themeSource = theme === 'system' ? 'system' : theme
    return true
  })

  // ── Platform Info ──────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.PLATFORM_INFO, async () => {
    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.versions.node,
      electronVersion: process.versions.electron,
      appVersion: (await import('electron')).app.getVersion()
    }
  })
}
