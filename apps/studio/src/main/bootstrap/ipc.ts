import type { Container, Logger } from "@ocs/common";

import { registerIpcHandlers } from "../ipc/handlers/index.js";

/**
 * Bootstraps IPC by registering all IPC handlers.
 * This should be called after all services are registered in the container.
 */
export function bootstrapIpc(container: Container, logger: Logger): void {
  logger.flow({ domain: "startup", source: "bootstrap", action: "ipc:start" });

  registerIpcHandlers(container);

  logger.flow({ domain: "startup", source: "bootstrap", action: "ipc:done" });
}
