import type { Container } from "@ocs/common";
import type { Logger } from "@ocs/common";
import {
  ExplorerService,
  TreeModel,
  ExplorerEventBus,
  WorkspaceProvider,
  LocalVirtualFileSystem
} from "@ocs/explorer";
import { ResourceService } from "@ocs/workspace/application";

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
  const workspaceService = container.resolve<any>(Symbol.for("workspace"));
  const workspaceFs = container.resolve<any>(Symbol.for("workspace.fs"));

  const resourceService = new ResourceService(workspaceFs);

  const explorerService = new ExplorerService(workspaceService, resourceService);
  const explorerFs = new LocalVirtualFileSystem();

  container.singleton(Symbol.for("explorer.fs"), () => explorerFs);
  container.singleton(Symbol.for("explorer.events"), () => explorerEventBus);
  container.singleton(Symbol.for("explorer.tree"), () => explorerService.treeModel);
  container.singleton(Symbol.for("explorer"), () => explorerService);

  logger.flow({ domain: "startup", source: "bootstrap", action: "explorer:done" });
  return explorerService;
}
