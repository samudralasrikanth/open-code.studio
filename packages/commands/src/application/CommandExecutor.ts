import type { EventBus, Logger } from "@ocs/common";
import { PlatformError } from "@ocs/common/errors";

import type { CommandRegistry } from "./CommandRegistry.js";

/**
 * Executes commands and handles tracing, telemetry, and event emissions.
 */
export class CommandExecutor {
  constructor(
    private readonly logger: Logger,
    private readonly eventBus: EventBus,
    private readonly registry: CommandRegistry
  ) {}

  /**
   * Executes a registered command by its ID.
   *
   * @param commandId The ID of the command to execute
   * @param args Optional arguments to pass to the command handler
   * @returns The result of the command handler
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async execute(commandId: string, args?: Record<string, any>): Promise<any> {
    const command = this.registry.get(commandId);
    if (!command) {
      throw new PlatformError({
        category: "system" as any,
        code: "OCS-COMMANDS-NOTFOUND",
        message: `Command '${commandId}' not found.`
      });
    }

    const startTime = performance.now();
    this.logger.debug(`Executing command: ${commandId}`);

    this.eventBus.publish("command.executing", {
      commandId,
      args,
      timestamp: Date.now()
    });

    try {
      const result = await command.handler(args);

      const durationMs = performance.now() - startTime;
      this.eventBus.publish("command.executed", {
        commandId,
        durationMs,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      const durationMs = performance.now() - startTime;

      this.logger.error(`Command execution failed: `, { error: String(error) } as any);

      this.eventBus.publish("command.failed", {
        commandId,
        error: String(error),
        durationMs,
        timestamp: Date.now()
      });

      throw new PlatformError({
        category: "system" as any,
        code: "OCS-COMMANDS-EXEC-FAILED",
        message: `Execution of command '${commandId}' failed.`,
        cause: error
      });
    }
  }
}
