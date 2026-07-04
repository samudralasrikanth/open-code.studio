export interface RendererCommand {
  id: string;
  title: string;
  category: string;
  description?: string;
  isVisible?: boolean;
  execute: (args?: any) => Promise<any> | any;
}

interface RendererCommandSearchResult {
  command: RendererCommand;
  score: number;
  highlightedTitle?: string;
}

const commands = new Map<string, RendererCommand>();

export function registerRendererCommand(command: RendererCommand): void {
  if (commands.has(command.id)) {
    return;
  }
  commands.set(command.id, command);
}

export function unregisterRendererCommand(commandId: string): void {
  commands.delete(commandId);
}

export function getRendererCommands(): RendererCommand[] {
  return Array.from(commands.values());
}

export function executeRendererCommand(commandId: string, args?: any): Promise<boolean> {
  const command = commands.get(commandId);
  if (!command) {
    return Promise.resolve(false);
  }
  return Promise.resolve(command.execute(args)).then(() => true);
}

export function searchRendererCommands(
  query: string,
  limit: number = 20
): RendererCommandSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase();
  const items = Array.from(commands.values()).filter((command) => command.isVisible !== false);

  if (!normalizedQuery) {
    return items
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, limit)
      .map((command) => ({ command, score: 0 }));
  }

  const results = items
    .map((command) => {
      const haystack = `${command.title} ${command.category} ${command.id}`.toLowerCase();
      const index = haystack.indexOf(normalizedQuery);
      const score = index >= 0 ? 100 - index : -1;
      return { command, score };
    })
    .filter((result) => result.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((result) => ({
      ...result,
      highlightedTitle: result.command.title
    }));

  return results;
}
