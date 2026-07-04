import type { Container, EventBus, Logger } from "@ocs/common";
import {
  SettingsService,
  SettingsRegistry,
  SettingsValidator,
  UserSettingsStore,
  WorkspaceSettingsStore
} from "@ocs/settings";

export async function bootstrapSettings(
  container: Container,
  logger: Logger,
  eventBus: EventBus
): Promise<void> {
  const registry = new SettingsRegistry();
  const validator = new SettingsValidator();
  const userStore = new UserSettingsStore();
  const workspaceStore = new WorkspaceSettingsStore();

  // Register some default schemas for testing/foundations
  registry.register({
    id: "editor.fontSize",
    title: "Font Size",
    description: "Controls the font size in pixels.",
    type: "number",
    defaultValue: 14,
    minimum: 6,
    maximum: 100,
    category: "Editor"
  });

  registry.register({
    id: "editor.wordWrap",
    title: "Word Wrap",
    description: "Controls whether lines should wrap.",
    type: "boolean",
    defaultValue: false,
    category: "Editor"
  });

  registry.register({
    id: "theme.current",
    title: "Color Theme",
    description: "Specifies the color theme used in the workbench.",
    type: "string",
    defaultValue: "system",
    enum: ["system", "light", "dark"],
    category: "Workbench"
  });

  registry.register({
    id: "extensions.marketplaceGalleryUrl",
    title: "Marketplace Gallery URL",
    description:
      "Changes the base URL for marketplace search results. You must restart Antigravity IDE to use the new marketplace after changing this value.",
    type: "string",
    defaultValue: "https://open-vsx.org/vscode/gallery",
    category: "Extensions"
  });

  registry.register({
    id: "extensions.marketplaceItemUrl",
    title: "Marketplace Item URL",
    description:
      "Changes the base URL on each extension page. You must restart Antigravity IDE to use the new marketplace after changing this value.",
    type: "string",
    defaultValue: "https://open-vsx.org/vscode/item",
    category: "Extensions"
  });

  const settingsService = new SettingsService(
    registry,
    validator,
    userStore,
    workspaceStore,
    eventBus
  );

  container.singleton(Symbol.for("SettingsRegistry"), () => registry);
  container.singleton(Symbol.for("SettingsService"), () => settingsService);

  // Note: WorkspaceStore needs initialization when a workspace is loaded.
  // Initially we load just user settings.
  // The StartupCoordinator will call `load` during bootstrap.
  // But wait, the WorkspaceSettingsStore needs a path.
  // In `bootstrapSettings`, we can just resolve it when a workspace is loaded,
  // or we can initialize it with a dummy or empty, but we must load it properly.
  // Since we might not have a workspace open at launch, we'll initialize it to null path inside,
  // which implies no workspace settings are loaded.

  await settingsService.load();
  logger.info("Settings Platform initialized");
}
