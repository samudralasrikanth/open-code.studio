import type { EventBus, Logger } from "@ocs/common";
import { PlatformError } from "@ocs/common/errors";

import type { ICommand } from "../domain/Command.js";

/**
 * The CommandRegistry maintains a list of all executable commands.
 */
export class CommandRegistry {
  private readonly commands = new Map<string, ICommand>();

  constructor(
    private readonly logger: Logger,
    private readonly eventBus: EventBus
  ) {}

  /**
   * Registers a new command.
   * Throws if a command with the same ID already exists.
   */
  public register(command: ICommand): void {
    if (this.commands.has(command.id)) {
      throw new PlatformError({
        category: "system" as any,
        code: "OCS-COMMANDS-DUPLICATE",
        message: `Command with ID '${command.id}' is already registered.`
      });
    }

    this.commands.set(command.id, command);

    this.logger.debug(`Registered command: ${command.id}`);

    this.eventBus.publish("command.registered", {
      commandId: command.id,
      command
    });
  }

  /**
   * Retrieves a command by ID.
   * @param id The command ID
   * @returns The command, or undefined if not found.
   */
  public get(id: string): ICommand | undefined {
    return this.commands.get(id);
  }

  /**
   * Returns all currently registered commands.
   */
  public getAll(): ICommand[] {
    return Array.from(this.commands.values());
  }
}
