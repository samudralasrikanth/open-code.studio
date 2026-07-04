import { CommandRegistry, CommandExecutor, CommandHistory, CommandSearch } from "@ocs/commands";
import type { Container } from "@ocs/common";
import { app } from "electron";

export function bootstrapCommands(container: Container): void {
  const logger = container.resolve<any>(Symbol.for("logger"));
  const eventBus = container.resolve<any>(Symbol.for("events"));

  const registry = new CommandRegistry(logger, eventBus);
  const executor = new CommandExecutor(logger, eventBus, registry);
  const history = new CommandHistory(eventBus);
  const searchEngine = new CommandSearch(registry);

  container.singleton(Symbol.for("commandRegistry"), () => registry);
  container.singleton(Symbol.for("commandExecutor"), () => executor);
  container.singleton(Symbol.for("commandHistory"), () => history);
  container.singleton(Symbol.for("commandSearch"), () => searchEngine);

  // Register foundational platform commands
  registry.register({
    id: "app.quit",
    title: "Application: Quit",
    category: "Application",
    handler: async () => {
      app.quit();
    }
  });

  registry.register({
    id: "terminal.new",
    title: "Terminal: Create New Terminal",
    category: "Terminal",
    handler: async () => {
      // Broadcast an event or call terminal manager
      eventBus.emit("terminal.create_requested", {});
    }
  });

  registry.register({
    id: "git.commit",
    title: "Git: Commit (Prompt)",
    category: "Git",
    handler: async () => {
      eventBus.emit("git.commit_requested", {});
    }
  });

  registry.register({
    id: "document.save",
    title: "Document: Save Current Document",
    category: "File",
    handler: async (args?: { uri?: string }) => {
      if (args?.uri) {
        const documentService = container.resolve<any>(Symbol.for("document"));
        const { uriFromString } = await import("@ocs/workspace");
        await documentService.saveDocument(uriFromString(args.uri));
      }
    }
  });

  registry.register({
    id: "settings:get-all",
    title: "Settings: Get All Settings",
    category: "Settings",
    handler: async () => {
      const settingsService = container.resolve<any>(Symbol.for("SettingsService"));
      return settingsService?.getAllResolved() || {};
    }
  });
}

