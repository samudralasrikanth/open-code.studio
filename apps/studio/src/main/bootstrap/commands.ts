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

  // Bridge legacy per-package command registries (registered as Symbol.for("commands"))
  // into the centralized commands registry so all commands are discoverable
  // through the main `commands` pipeline and IPC handlers.
  try {
    const legacy = container.resolve<any>(Symbol.for("commands"));
    if (legacy && typeof legacy.getCommands === "function") {
      const legacyList = legacy.getCommands();
      for (const legacyCmd of legacyList) {
        try {
          registry.register({
            id: legacyCmd.id,
            title: (legacyCmd as any).title || legacyCmd.id,
            category: (legacyCmd as any).category || "Platform",
            // Adapter: call legacy `execute` if present
            handler: async (args?: any) => {
              if (typeof legacyCmd.execute === "function") {
                return await legacyCmd.execute(args);
              }
              return undefined;
            },
            enableWhen: (legacyCmd as any).enableWhen,
            isVisible: (legacyCmd as any).isVisible
          });
        } catch (err) {
          // Ignore duplicate registrations or adapter failures — log and continue
          // eslint-disable-next-line no-console
          console.warn(`Failed to bridge legacy command ${legacyCmd.id}: ${String(err)}`);
        }
      }
    }
  } catch {
    // No legacy registry present — nothing to bridge
  }

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
