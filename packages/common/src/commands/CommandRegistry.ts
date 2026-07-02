/**
 * Represents an executable command with arguments.
 */
export interface ICommand<TArgs = unknown, TResult = void> {
  readonly id: string;
  execute(args: TArgs): Promise<TResult> | TResult;
}

/**
 * A registry of commands. Similar to Command Palette.
 */
export class CommandRegistry {
  private readonly commands: Map<string, ICommand<unknown, unknown>> = new Map();

  public registerCommand<TArgs, TResult>(command: ICommand<TArgs, TResult>): void {
    if (this.commands.has(command.id)) {
      throw new Error(`Command already registered: ${command.id}`);
    }
    this.commands.set(command.id, command);
  }

  public getCommand(id: string): ICommand<unknown, unknown> | undefined {
    return this.commands.get(id);
  }

  public async executeCommand<TArgs, TResult>(id: string, args: TArgs): Promise<TResult> {
    const command = this.commands.get(id);
    if (!command) {
      throw new Error(`Command not found: ${id}`);
    }
    return command.execute(args) as Promise<TResult>;
  }

  public getCommands(): ICommand<unknown, unknown>[] {
    return Array.from(this.commands.values());
  }
}
