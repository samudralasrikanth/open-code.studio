import type { Container } from "@ocs/common";
import { EventBus, Logger } from "@ocs/common";
import { app } from "electron";

import {
  ThemeRegistry,
  ThemeManager,
  ThemeLoader,
  ThemeSerializer,
  CssVariableGenerator,
  MonacoThemeAdapter
} from "@ocs/theme";

import {
  NotificationQueue,
  NotificationHistory,
  ProgressManager,
  NotificationService
} from "@ocs/notifications";

import { ContextService, KeybindingRegistry, KeybindingResolver } from "@ocs/keybindings";

import { SessionStore, SessionManager } from "@ocs/session";

export function bootstrapThemeNotificationKeybindingSession(
  container: Container,
  logger: Logger,
  eventBus: EventBus
): void {
  // Theme Platform
  const themeRegistry = new ThemeRegistry();
  const cssGenerator = new CssVariableGenerator();
  const monacoAdapter = new MonacoThemeAdapter();
  const themeManager = new ThemeManager(themeRegistry, cssGenerator, monacoAdapter, eventBus);
  const themeSerializer = new ThemeSerializer();
  const themeLoader = new ThemeLoader(themeSerializer);

  container.singleton(Symbol.for("ThemeRegistry"), () => themeRegistry);
  container.singleton(Symbol.for("ThemeManager"), () => themeManager);
  container.singleton(Symbol.for("ThemeLoader"), () => themeLoader);
  container.singleton(Symbol.for("ThemeSerializer"), () => themeSerializer);
  container.singleton(Symbol.for("CssVariableGenerator"), () => cssGenerator);
  container.singleton(Symbol.for("MonacoThemeAdapter"), () => monacoAdapter);

  // Notification Platform
  const notificationQueue = new NotificationQueue(eventBus);
  const notificationHistory = new NotificationHistory();
  const notificationService = new NotificationService(notificationQueue, notificationHistory);
  const progressManager = new ProgressManager(notificationService);

  container.singleton(Symbol.for("NotificationQueue"), () => notificationQueue);
  container.singleton(Symbol.for("NotificationHistory"), () => notificationHistory);
  container.singleton(Symbol.for("NotificationService"), () => notificationService);
  container.singleton(Symbol.for("ProgressManager"), () => progressManager);

  // Keyboard Shortcuts (Keybindings) Platform
  const contextService = new ContextService(eventBus);
  const keybindingRegistry = new KeybindingRegistry();
  const keybindingResolver = new KeybindingResolver(keybindingRegistry, contextService);

  container.singleton(Symbol.for("ContextService"), () => contextService);
  container.singleton(Symbol.for("KeybindingRegistry"), () => keybindingRegistry);
  container.singleton(Symbol.for("KeybindingResolver"), () => keybindingResolver);

  // Session & Workbench Restore
  const userDataPath = app.getPath("userData");
  const sessionStore = new SessionStore(userDataPath);
  const sessionManager = new SessionManager(sessionStore, eventBus);

  container.singleton(Symbol.for("SessionStore"), () => sessionStore);
  container.singleton(Symbol.for("SessionManager"), () => sessionManager);

  logger.info("Theme, Notifications, Keybindings, and Session platforms bootstrapped");
}
