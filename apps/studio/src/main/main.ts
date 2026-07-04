/* eslint-disable */
import { app, BrowserWindow, shell } from "electron";
import { createContainer, createLifecycleManager, createLogger } from "@ocs/common";

import {
  bootstrapDesktop,
  bootstrapDocument,
  bootstrapExplorer,
  bootstrapIpc,
  bootstrapWorkspace,
  bootstrapTerminal,
  bootstrapCommands,
  bootstrapSearch,
  bootstrapSettings,
  bootstrapThemeNotificationKeybindingSession,
  bootstrapExtensions,
  wireExplorerProvider,
  StartupCoordinator
} from "./bootstrap/index.js";
import { createApplicationMenu } from "./menu.js";
import { restoreLastWorkspace } from "./ipc/handlers/index.js";

process.on("uncaughtException", (err: any) => {
  if (err?.code === "EPIPE" || err?.message?.includes("EPIPE")) return;
  console.error("Uncaught exception in main process:", err);
});

app.setName("Open-Code.Studio");

const container = createContainer();
const lifecycle = createLifecycleManager();
const logger = createLogger({ level: "info" });
const coordinator = new StartupCoordinator(logger);

container.singleton(Symbol.for("logger"), () => logger);
container.singleton(Symbol.for("lifecycle"), () => lifecycle);
container.singleton(Symbol.for("startup"), () => coordinator);

// ─── Startup Phases ────────────────────────────────────────────────────────

coordinator.register({
  name: "desktop",
  dependsOn: [],
  execute: async () => {
    const windowManager = await bootstrapDesktop(logger, container);
    container.singleton(Symbol.for("windowManager"), () => windowManager);

    app.on("activate", () => {
      // macOS: re-create window when dock icon is clicked and no windows are open
      if (BrowserWindow.getAllWindows().length === 0) {
        windowManager.createMainWindow();
      }
    });
  }
});

coordinator.register({
  name: "workspace",
  dependsOn: ["desktop"],
  execute: async () => {
    const userDataPath = app.getPath("userData");
    await bootstrapWorkspace(container, userDataPath, logger);
    await createApplicationMenu(container);
  }
});

coordinator.register({
  name: "explorer",
  dependsOn: ["workspace"],
  execute: () => {
    bootstrapExplorer(container, logger);
    // Wire the provider now that both Explorer and Workspace are ready
    wireExplorerProvider(container, logger);
  }
});

coordinator.register({
  name: "document",
  dependsOn: ["workspace"],
  execute: () => {
    bootstrapDocument(container, logger);
  }
});

coordinator.register({
  name: "terminal",
  dependsOn: ["workspace"],
  execute: () => {
    bootstrapTerminal(container, logger);
  }
});

coordinator.register({
  name: "commands",
  dependsOn: ["workspace"],
  execute: () => {
    bootstrapCommands(container);
  }
});

coordinator.register({
  name: "search",
  dependsOn: ["workspace"],
  execute: async () => {
    const eventBus = container.resolve(Symbol.for("events"));
    bootstrapSearch(container, eventBus as any);
  }
});

coordinator.register({
  name: "settings",
  dependsOn: ["workspace"],
  execute: async () => {
    const eventBus = container.resolve(Symbol.for("events"));
    await bootstrapSettings(container, logger, eventBus as any);
  }
});

coordinator.register({
  name: "theme-notification-keybinding-session",
  dependsOn: ["settings"],
  execute: () => {
    const eventBus = container.resolve(Symbol.for("events"));
    bootstrapThemeNotificationKeybindingSession(container, logger, eventBus as any);
  }
});

coordinator.register({
  name: "extensions",
  dependsOn: ["workspace"],
  execute: () => {
    bootstrapExtensions(container, logger);
  }
});

coordinator.register({
  name: "ipc",
  dependsOn: [
    "explorer",
    "document",
    "terminal",
    "commands",
    "search",
    "settings",
    "extensions",
    "theme-notification-keybinding-session"
  ],
  execute: () => {
    bootstrapIpc(container, logger);
  }
});

coordinator.register({
  name: "restore",
  dependsOn: ["ipc"],
  execute: async () => {
    const restored = await restoreLastWorkspace(container);
    if (restored) {
      logger.info("Restored previous workspace session");
    }
  }
});

// ─── Application Lifecycle ──────────────────────────────────────────────────

app.whenReady().then(async () => {
  logger.info("Open-Code.Studio starting", { version: app.getVersion() });
  await coordinator.run();
  logger.info("Desktop host ready");
});

app.on("window-all-closed", () => {
  // On macOS, keep the process alive when all windows are closed
  if (process.platform !== "darwin") {
    logger.info("All windows closed — quitting");
    app.quit();
  }
});

app.on("before-quit", async () => {
  logger.info("Application shutting down");
  await lifecycle.stop();
});

// Security: block navigation to external URLs
app.on("web-contents-created", (_event, contents) => {
  contents.on("will-navigate", (event, url) => {
    const { origin } = new URL(url);
    if (origin !== "http://localhost:5173" && !url.startsWith("file://")) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
});

export { container, lifecycle, logger };
