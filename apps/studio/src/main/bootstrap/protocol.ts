import { protocol, net } from "electron";
import { join } from "path";
import * as os from "os";
import * as fs from "fs";
import type { Logger } from "@ocs/common";

export function bootstrapProtocol(logger: Logger): void {
  protocol.handle("ocs-ext", async (req) => {
    try {
      const url = new URL(req.url);
      const host = url.host; // extension id e.g. alexdauenhauer.catppuccin-noctis-icons
      const filepath = decodeURIComponent(url.pathname);

      const extensionsDir = join(os.homedir(), ".ocs", "extensions");
      // Map to ~/.ocs/extensions/{id}/extension{filepath}
      // Note: filepath includes a leading slash, e.g. /icons/folders/folder.svg
      const absolutePath = join(extensionsDir, host, "extension", filepath);

      // Security: ensure absolutePath is within extensionsDir
      if (!absolutePath.startsWith(extensionsDir)) {
        logger.warn(`Blocked attempt to access path outside extensions dir: ${absolutePath}`);
        return new Response("Forbidden", { status: 403 });
      }

      if (fs.existsSync(absolutePath)) {
        const data = await fs.promises.readFile(absolutePath);
        let contentType = "application/octet-stream";
        if (absolutePath.endsWith(".svg")) contentType = "image/svg+xml";
        else if (absolutePath.endsWith(".png")) contentType = "image/png";
        else if (absolutePath.endsWith(".jpg") || absolutePath.endsWith(".jpeg"))
          contentType = "image/jpeg";
        else if (absolutePath.endsWith(".json")) contentType = "application/json";

        return new Response(data, {
          headers: { "Content-Type": contentType }
        });
      }
      return new Response("Not found", { status: 404 });
    } catch (error: any) {
      logger.error(`Error in ocs-ext protocol handler: ${error.message}`);
      return new Response("Internal Server Error", { status: 500 });
    }
  });
}
