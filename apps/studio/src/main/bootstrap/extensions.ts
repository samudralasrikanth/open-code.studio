import type { Container, Logger } from "@ocs/common";
import {
  ExtensionService,
  OpenVSXProvider,
  ExtensionRegistry,
  IconThemeService
} from "@ocs/extensions";
import type { SettingsService } from "@ocs/settings";

export function bootstrapExtensions(container: Container, logger: Logger): void {
  logger.flow({ domain: "startup", source: "bootstrap", action: "extensions:start" });

  const settingsService = container.resolve<SettingsService>(Symbol.for("SettingsService"));

  const galleryUrl = settingsService.get("extensions.marketplaceGalleryUrl") as string | undefined;
  const itemUrl = settingsService.get("extensions.marketplaceItemUrl") as string | undefined;

  const provider = new OpenVSXProvider({
    galleryUrl,
    itemUrl
  });

  const registry = new ExtensionRegistry();
  // Pre-load registry in background (startup scan)
  registry.load().catch((err) => {
    logger.error("Failed to load extension registry on startup", err);
  });

  const service = new ExtensionService(provider, registry);
  const iconThemeService = new IconThemeService(registry, logger);

  container.singleton(Symbol.for("extensionsRegistry"), () => registry);
  container.singleton(Symbol.for("extensionsService"), () => service);
  container.singleton(Symbol.for("iconThemeService"), () => iconThemeService);

  logger.flow({ domain: "startup", source: "bootstrap", action: "extensions:done" });
}
