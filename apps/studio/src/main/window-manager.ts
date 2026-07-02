/* eslint-disable */
import { join } from "path";

import { is } from "@electron-toolkit/utils";
import type { Logger } from "@ocs/common";
import { BrowserWindow, shell } from "electron";

export interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

export interface WindowManager {
  createMainWindow(): BrowserWindow;
  getMainWindow(): BrowserWindow | null;
  health(): { healthy: boolean; message?: string };
}

const DEFAULT_STATE: WindowState = {
  width: 1280,
  height: 800,
  isMaximized: false
};

// Simple in-memory window state persistence (EPIC-0004 will add disk persistence)
let persistedState: WindowState = { ...DEFAULT_STATE };

export function createWindowManager(logger: Logger): WindowManager {
  let mainWindow: BrowserWindow | null = null;

  function createMainWindow(): BrowserWindow {
    logger.info("Creating main window", {
      width: persistedState.width,
      height: persistedState.height
    });

    const win = new BrowserWindow({
      width: persistedState.width,
      height: persistedState.height,
      x: persistedState.x,
      y: persistedState.y,
      minWidth: 800,
      minHeight: 600,
      show: false, // Show after renderer is ready for a smooth startup
      autoHideMenuBar: true,
      backgroundColor: "#0d0d0d", // Match dark theme background to prevent flash
      webPreferences: {
        preload: join(__dirname, "../preload/preload.js"),
        sandbox: false,
        nodeIntegration: false,
        contextIsolation: true
      },
      titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
      icon: join(__dirname, "../../resources/icon.png")
    });

    // Show window gracefully once renderer content is loaded
    win.on("ready-to-show", () => {
      win.show();
      if (persistedState.isMaximized) {
        win.maximize();
      }
    });

    // Track window state changes for persistence
    const saveState = (): void => {
      if (!win.isMaximized() && !win.isMinimized()) {
        const bounds = win.getBounds();
        persistedState = { ...bounds, isMaximized: false };
      } else {
        persistedState = { ...persistedState, isMaximized: win.isMaximized() };
      }
    };

    win.on("resize", saveState);
    win.on("move", saveState);
    win.on("maximize", () => {
      persistedState.isMaximized = true;
    });
    win.on("unmaximize", () => {
      persistedState.isMaximized = false;
    });

    win.on("closed", () => {
      logger.info("Main window closed");
      mainWindow = null;
    });

    // Open external links in the OS browser, not in Electron
    win.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: "deny" };
    });

    // Load the renderer
    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
      win.loadFile(join(__dirname, "../renderer/index.html"));
    }

    mainWindow = win;
    logger.info("Main window created");
    return win;
  }

  function getMainWindow(): BrowserWindow | null {
    return mainWindow;
  }

  function health(): { healthy: boolean; message?: string } {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return { healthy: false, message: "Main window is not available" };
    }
    return { healthy: true };
  }

  return { createMainWindow, getMainWindow, health };
}
