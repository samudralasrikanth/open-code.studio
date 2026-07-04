/* eslint-disable */
import { Menu, shell, app, dialog } from "electron";
import type { Container } from "@ocs/common";
import type { RecentWorkspace } from "@ocs/workspace";
import { uriToPath } from "@ocs/workspace";

/**
 * Creates and sets the native application menu.
 * Platform-specific behaviour:
 *  - macOS: App menu prefix added automatically by the OS
 *  - Windows/Linux: Standard File/Edit/View/Window/Help menu bar
 */
export async function createApplicationMenu(container?: Container): Promise<void> {
  const isMac = process.platform === "darwin";

  const openFolder = async (): Promise<void> => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"]
    });
    if (canceled || filePaths.length === 0 || !container) return;

    try {
      const workspaceService = container.resolve<any>(Symbol.for("workspace"));
      if (workspaceService && typeof workspaceService.open === "function") {
        await workspaceService.open(filePaths[0]);
      }
    } catch (error) {
      console.error("Failed to open folder from menu:", error);
    }
  };

  const openRecentEntry = async (entry: RecentWorkspace): Promise<void> => {
    try {
      if (!container) {
        console.error("Unable to open recent workspace: container missing");
        return;
      }

      const workspaceService = container.resolve<any>(Symbol.for("workspace"));
      if (!workspaceService || typeof workspaceService.open !== "function") {
        console.error("Unable to open recent workspace: workspaceService not available");
        return;
      }

      const path = uriToPath(entry.uri);
      await workspaceService.open(path);
    } catch (error) {
      console.error("Failed to open recent workspace from menu:", error);
    }
  };

  const buildOpenRecentSubmenu = async (): Promise<Electron.MenuItemConstructorOptions[]> => {
    if (!container) {
      return [
        {
          label: "No recent workspaces",
          enabled: false
        }
      ];
    }

    try {
      const workspaceService = container.resolve<any>(Symbol.for("workspace"));
      if (!workspaceService || typeof workspaceService.getRecent !== "function") {
        return [
          {
            label: "No recent workspaces",
            enabled: false
          }
        ];
      }

      const recentWorkspaces: readonly RecentWorkspace[] = workspaceService.getRecent();
      if (!Array.isArray(recentWorkspaces) || recentWorkspaces.length === 0) {
        return [
          {
            label: "No recent workspaces",
            enabled: false
          }
        ];
      }

      return recentWorkspaces.map((entry) => ({
        label: entry.displayName,
        click: async (): Promise<void> => {
          await openRecentEntry(entry);
        }
      }));
    } catch (error) {
      console.error("Failed to build Open Recent submenu:", error);
      return [
        {
          label: "Unable to load recent workspaces",
          enabled: false
        }
      ];
    }
  };

  const openRecentSubmenu = await buildOpenRecentSubmenu();

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
          click: async (): Promise<void> => {
            try {
              if (!container) {
                console.error("Unable to create new window: container missing");
                return;
              }

              const windowManager = container.resolve<any>(Symbol.for("windowManager"));
              if (windowManager && typeof windowManager.createMainWindow === "function") {
                windowManager.createMainWindow();
              } else {
                console.error("Unable to create new window: windowManager not available");
              }
            } catch (error) {
              console.error("Failed to create new window from menu:", error);
            }
          }
        },
        {
          label: "Open Folder...",
          accelerator: "CmdOrCtrl+O",
          click: async (): Promise<void> => {
            await openFolder();
          }
        },
        {
          label: "Open Recent",
          submenu: openRecentSubmenu
        },
        { type: "separator" as const },
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
