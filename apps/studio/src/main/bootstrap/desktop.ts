import type { Logger } from "@ocs/common";

import { createApplicationMenu } from "../menu.js";
import { createWindowManager } from "../window-manager.js";
import type { WindowManager } from "../window-manager.js";

/**
 * Bootstraps the Desktop infrastructure:
 * - Native application menu
 * - WindowManager + main window creation
 *
 * Returns the WindowManager so callers can access the main window.
 */
export function bootstrapDesktop(logger: Logger): WindowManager {
  logger.flow({ domain: "startup", source: "bootstrap", action: "desktop:start" });

  createApplicationMenu();
  const windowManager = createWindowManager(logger);
  windowManager.createMainWindow();

  logger.flow({ domain: "startup", source: "bootstrap", action: "desktop:done" });
  return windowManager;
}
