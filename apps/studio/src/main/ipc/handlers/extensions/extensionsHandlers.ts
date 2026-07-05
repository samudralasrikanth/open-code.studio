import type { Container } from "@ocs/common";
import type {
  ExtensionService,
  ExtensionRegistry,
  ExtensionQuery,
  ExtensionQueryResult
} from "@ocs/extensions";
import { ipcMain } from "electron";

export function registerExtensionsHandlers(container: Container): void {
  ipcMain.handle(
    "extensions:search",
    async (
      _event: Electron.IpcMainInvokeEvent,
      query: ExtensionQuery
    ): Promise<{
      success: boolean;
      data?: ExtensionQueryResult;
      error?: { code: string; message: string };
    }> => {
      try {
        const service = container.resolve<ExtensionService>(Symbol.for("extensionsService"));
        const result = await service.search(query);
        return { success: true, data: result };
      } catch (error: unknown) {
        const err = error as { code?: string; message: string };
        return {
          success: false,
          error: {
            code: err.code || "UNKNOWN",
            message: err.message || "Unknown error"
          }
        };
      }
    }
  );

  ipcMain.handle(
    "extensions:install",
    async (_event: Electron.IpcMainInvokeEvent, id: string, version?: string) => {
      try {
        const service = container.resolve<ExtensionService>(Symbol.for("extensionsService"));
        await service.install(id, version);
        return { success: true };
      } catch (error: unknown) {
        const err = error as { code?: string; message: string };
        return {
          success: false,
          error: {
            code: err.code || "UNKNOWN",
            message: err.message || "Unknown error"
          }
        };
      }
    }
  );

  ipcMain.handle(
    "extensions:getVersions",
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      try {
        const service = container.resolve<ExtensionService>(Symbol.for("extensionsService"));
        const versions = await service.getVersions(id);
        return { success: true, data: versions };
      } catch (error: unknown) {
        const err = error as { message: string };
        return { success: false, error: { message: err.message || "Unknown error" } };
      }
    }
  );

  ipcMain.handle(
    "extensions:downloadVSIX",
    async (_event: Electron.IpcMainInvokeEvent, id: string, version?: string) => {
      try {
        const { dialog } = await import("electron");
        const fs = await import("fs/promises");
        const service = container.resolve<ExtensionService>(Symbol.for("extensionsService"));

        const { canceled, filePath } = await dialog.showSaveDialog({
          title: `Download Extension VSIX`,
          defaultPath: `${id}${version ? `-${version}` : ""}.vsix`,
          filters: [{ name: "VSIX Extension", extensions: ["vsix"] }]
        });

        if (canceled || !filePath) {
          return { success: true }; // User cancelled, not an error
        }

        const buffer = await service.download(id, version);
        await fs.writeFile(filePath, buffer);

        return { success: true };
      } catch (error: unknown) {
        const err = error as { message: string };
        return { success: false, error: { message: err.message || "Unknown error" } };
      }
    }
  );

  ipcMain.handle(
    "extensions:getDetails",
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      try {
        const service = container.resolve<ExtensionService>(Symbol.for("extensionsService"));
        const details = await service.getDetails(id);

        if (!details) {
          return { success: false, error: { code: "NOT_FOUND", message: "Extension not found" } };
        }

        // Also fetch the readme
        const readme = await service.getReadme(id);

        return { success: true, data: { ...details, readme } };
      } catch (error: unknown) {
        const err = error as { code?: string; message: string };
        return {
          success: false,
          error: {
            code: err.code || "UNKNOWN",
            message: err.message || "Unknown error"
          }
        };
      }
    }
  );

  ipcMain.handle(
    "extensions:isInstalled",
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      try {
        const service = container.resolve<ExtensionService>(Symbol.for("extensionsService"));
        const isInstalled = await service.isInstalled(id);
        return { success: true, data: isInstalled };
      } catch (error: unknown) {
        const err = error as { message: string };
        return { success: false, error: { message: err.message || "Unknown error" } };
      }
    }
  );

  ipcMain.handle("extensions:getInstalled", async (_event: Electron.IpcMainInvokeEvent) => {
    try {
      const registry = container.resolve<ExtensionRegistry>(Symbol.for("extensionsRegistry"));
      const installed = await registry.getAll();
      return { success: true, data: installed };
    } catch (error: unknown) {
      const err = error as { message: string };
      return { success: false, error: { message: err.message || "Unknown error" } };
    }
  });

  ipcMain.handle("extensions:enable", async (_event: Electron.IpcMainInvokeEvent, id: string) => {
    try {
      const registry = container.resolve<ExtensionRegistry>(Symbol.for("extensionsRegistry"));
      await registry.enable(id);
      return { success: true };
    } catch (error: unknown) {
      const err = error as { message: string };
      return { success: false, error: { message: err.message || "Unknown error" } };
    }
  });

  ipcMain.handle("extensions:disable", async (_event: Electron.IpcMainInvokeEvent, id: string) => {
    try {
      const registry = container.resolve<ExtensionRegistry>(Symbol.for("extensionsRegistry"));
      await registry.disable(id);
      return { success: true };
    } catch (error: unknown) {
      const err = error as { message: string };
      return { success: false, error: { message: err.message || "Unknown error" } };
    }
  });

  ipcMain.handle(
    "extensions:uninstall",
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      try {
        const service = container.resolve<ExtensionService>(Symbol.for("extensionsService"));
        await service.uninstall(id);
        return { success: true };
      } catch (error: unknown) {
        const err = error as { message: string };
        return { success: false, error: { message: err.message || "Unknown error" } };
      }
    }
  );

  ipcMain.handle("extensions:getActiveIconTheme", async (_event: Electron.IpcMainInvokeEvent) => {
    try {
      const service = container.resolve<any>(Symbol.for("iconThemeService"));
      const theme = await service.getActiveTheme();
      return { success: true, data: theme };
    } catch (error: any) {
      return { success: false, error: { message: error.message } };
    }
  });
}
