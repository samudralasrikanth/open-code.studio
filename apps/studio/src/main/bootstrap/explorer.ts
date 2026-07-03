import type { Container } from "@ocs/common";
import type { Logger } from "@ocs/common";
import {
  ExplorerService,
  TreeModel,
  ExplorerEventBus,
  WorkspaceProvider,
  LocalVirtualFileSystem
} from "@ocs/explorer";

/**
 * Bootstraps the Explorer infrastructure:
 * - ExplorerEventBus
 * - TreeModel
 * - ExplorerService
 * - LocalVirtualFileSystem (for explorer reads)
 *
 * Provider registration happens separately in the wire phase.
 * Explorer depends only on ExplorerProvider interface, not WorkspaceService.
 *
 * Registers singletons in the container under:
 *   Symbol.for("explorer.fs"), Symbol.for("explorer.events"),
 *   Symbol.for("explorer.tree"), Symbol.for("explorer")
 */
export function bootstrapExplorer(container: Container, logger: Logger): ExplorerService {
  logger.flow({ domain: "startup", source: "bootstrap", action: "explorer:start" });

  const explorerEventBus = new ExplorerEventBus();
  const treeModel = new TreeModel();
  const explorerService = new ExplorerService(treeModel, explorerEventBus);
  const explorerFs = new LocalVirtualFileSystem();

  container.singleton(Symbol.for("explorer.fs"), () => explorerFs);
  container.singleton(Symbol.for("explorer.events"), () => explorerEventBus);
  container.singleton(Symbol.for("explorer.tree"), () => treeModel);
  container.singleton(Symbol.for("explorer"), () => explorerService);

  logger.flow({ domain: "startup", source: "bootstrap", action: "explorer:done" });
  return explorerService;
}

/**
 * Wires the WorkspaceProvider into the ExplorerService.
 * This is called after both Explorer and Workspace are bootstrapped.
 *
 * Dependency direction: Explorer → IWorkspaceProvider (provider contract).
 * Explorer does not know about WorkspaceService.
 */
export function wireExplorerProvider(container: Container, logger: Logger): void {
  logger.flow({ domain: "startup", source: "bootstrap", action: "explorer:wire-provider:start" });

  const explorerService = container.resolve<ExplorerService>(Symbol.for("explorer"));
  const explorerFs = container.resolve<LocalVirtualFileSystem>(Symbol.for("explorer.fs"));

  const workspaceProvider = new WorkspaceProvider(explorerFs);
  container.singleton(Symbol.for("explorer.provider.workspace"), () => workspaceProvider);
  explorerService.registerProvider(workspaceProvider);

  logger.flow({ domain: "startup", source: "bootstrap", action: "explorer:wire-provider:done" });
}
