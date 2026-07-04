import type { Container, Logger } from "@ocs/common";
import { ExtensionService, OpenVSXProvider } from "@ocs/extensions";
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

  const service = new ExtensionService(provider);

  container.singleton(Symbol.for("extensionsService"), () => service);

  logger.flow({ domain: "startup", source: "bootstrap", action: "extensions:done" });
}
