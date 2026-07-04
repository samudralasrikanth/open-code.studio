/* eslint-disable */
import type { Container, Logger } from "@ocs/common";
import { TerminalService } from "@ocs/terminal";

/**
 * Bootstraps the Terminal infrastructure.
 *
 * Registers the TerminalService singleton in the container under:
 *   Symbol.for("terminal")
 */
export function bootstrapTerminal(container: Container, logger: Logger): TerminalService {
  logger.flow({ domain: "startup", source: "bootstrap", action: "terminal:start" });

  const eventBus = container.resolve<any>(Symbol.for("events"));
  const terminalService = new TerminalService(logger, eventBus);

  container.singleton(Symbol.for("terminal"), () => terminalService);

  // Bind to lifecycle manager for clean shutdown of all spawned processes
  const lifecycle = container.resolve<any>(Symbol.for("lifecycle"));
  if (lifecycle) {
    lifecycle.register({
      name: "TerminalService",
      start: () => {},
      stop: () => {
        logger.info("Lifecycle stopping: disposing active PTY terminal sessions");
        terminalService.dispose();
      }
    });
  }

  logger.flow({ domain: "startup", source: "bootstrap", action: "terminal:done" });
  return terminalService;
}
