/* eslint-disable */
import { Menu, shell, app } from "electron";

/**
 * Creates and sets the native application menu.
 * Platform-specific behaviour:
 *  - macOS: App menu prefix added automatically by the OS
 *  - Windows/Linux: Standard File/Edit/View/Window/Help menu bar
 */
export function createApplicationMenu(): void {
  const isMac = process.platform === "darwin";

  const template: Electron.MenuItemConstructorOptions[] = [
    // macOS App menu (first menu is always the app name)
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" as const },
              { type: "separator" as const },
              { role: "services" as const },
              { type: "separator" as const },
              { role: "hide" as const },
              { role: "hideOthers" as const },
              { role: "unhide" as const },
              { type: "separator" as const },
              { role: "quit" as const }
            ]
          }
        ]
      : []),

    // File
    {
      label: "File",
      submenu: [
        {
          label: "New Window",
          accelerator: "CmdOrCtrl+Shift+N",
          click: (): void => {
            // EPIC-0004 will implement workspace management
          }
        },
        { type: "separator" },
        isMac ? { role: "close" as const } : { role: "quit" as const }
      ]
    },

    // Edit
    {
      label: "Edit",
      submenu: [
        { role: "undo" as const },
        { role: "redo" as const },
        { type: "separator" as const },
        { role: "cut" as const },
        { role: "copy" as const },
        { role: "paste" as const },
        ...(isMac
          ? [
              { role: "pasteAndMatchStyle" as const },
              { role: "delete" as const },
              { role: "selectAll" as const }
            ]
          : [
              { role: "delete" as const },
              { type: "separator" as const },
              { role: "selectAll" as const }
            ])
      ]
    },

    // View
    {
      label: "View",
      submenu: [
        { role: "reload" as const },
        { role: "forceReload" as const },
        { role: "toggleDevTools" as const },
        { type: "separator" as const },
        { role: "resetZoom" as const },
        { role: "zoomIn" as const },
        { role: "zoomOut" as const },
        { type: "separator" as const },
        { role: "togglefullscreen" as const }
      ]
    },

    // Window
    {
      label: "Window",
      submenu: [
        { role: "minimize" as const },
        { role: "zoom" as const },
        ...(isMac
          ? [
              { type: "separator" as const },
              { role: "front" as const },
              { type: "separator" as const },
              { role: "window" as const }
            ]
          : [{ role: "close" as const }])
      ]
    },

    // Help
    {
      role: "help" as const,
      submenu: [
        {
          label: "Documentation",
          click: async (): Promise<void> => {
            await shell.openExternal("https://open-code.studio/docs");
          }
        },
        {
          label: "Report Issue",
          click: async (): Promise<void> => {
            await shell.openExternal("https://github.com/open-code-studio/open-code.studio/issues");
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
