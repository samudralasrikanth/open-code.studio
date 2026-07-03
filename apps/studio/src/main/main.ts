/* eslint-disable */
import { app, BrowserWindow, shell } from "electron";
import { createContainer, createLifecycleManager, createLogger } from "@ocs/common";

import {
  bootstrapDesktop,
  bootstrapDocument,
  bootstrapExplorer,
  bootstrapIpc,
  bootstrapWorkspace,
  wireExplorerProvider,
  StartupCoordinator
} from "./bootstrap/index.js";
import { restoreLastWorkspace } from "./ipc/handlers/index.js";

app.name = "Open-Code.Studio";
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
  execute: () => {
    const windowManager = bootstrapDesktop(logger);
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
  name: "ipc",
  dependsOn: ["explorer", "document"],
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
