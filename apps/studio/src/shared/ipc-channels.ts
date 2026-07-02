/**
 * Typed IPC channel names shared between the main process and the renderer.
 *
 * Both sides import from this file so that channel strings never go out of
 * sync. Changing a channel name here is a single-file change.
 */
export const IpcChannels = {
  // Health & diagnostics
  HEALTH_CHECK: 'health:check',
  PLATFORM_INFO: 'platform:info',

  // Theme management
  THEME_GET: 'theme:get',
  THEME_SET: 'theme:set',
  THEME_CHANGED: 'theme:changed',  // main → renderer push event

  // Application lifecycle
  APP_QUIT: 'app:quit',
  APP_MINIMIZE: 'app:minimize',
  APP_MAXIMIZE: 'app:maximize',
  APP_TOGGLE_MAXIMIZE: 'app:toggle-maximize',
  APP_IS_MAXIMIZED: 'app:is-maximized'
} as const

export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels]
