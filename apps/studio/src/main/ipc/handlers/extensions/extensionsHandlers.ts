import type { Container } from "@ocs/common";
import type { ExtensionService, ExtensionQuery, ExtensionQueryResult } from "@ocs/extensions";
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
        const service = container.resolve<ExtensionService>(Symbol.for("extensionsService") as any);
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

  ipcMain.handle("extensions:install", async (_event: Electron.IpcMainInvokeEvent, id: string) => {
    try {
      const service = container.resolve<ExtensionService>(Symbol.for("extensionsService") as any);
      await service.install(id);
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
  });

  ipcMain.handle(
    "extensions:getDetails",
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      try {
        const service = container.resolve<ExtensionService>(Symbol.for("extensionsService") as any);
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
        const service = container.resolve<ExtensionService>(Symbol.for("extensionsService") as any);
        const isInstalled = await service.isInstalled(id);
        return { success: true, data: isInstalled };
      } catch (error: unknown) {
        const err = error as { message: string };
        return { success: false, error: { message: err.message || "Unknown error" } };
      }
    }
  );
}
