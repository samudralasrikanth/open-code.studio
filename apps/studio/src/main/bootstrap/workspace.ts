import { join } from "path";

import type { Container } from "@ocs/common";
import type { Logger } from "@ocs/common";
import { createLocalFileSystem, createJsonStorageAdapter } from "@ocs/workspace";
import {
  WorkspaceSettingsRepository,
  WorkspaceRegistry,
  createWorkspaceService
} from "@ocs/workspace/application";
import type { PersistedWorkspaceState, WorkspaceService } from "@ocs/workspace/application";

/**
 * Bootstraps the Workspace infrastructure:
 * - LocalFileSystem
 * - JsonStorageAdapter (persisted workspace state)
 * - WorkspaceSettingsRepository
 * - WorkspaceRegistry
 * - WorkspaceService
 *
 * Registers singletons in the container under:
 *   Symbol.for("workspace.fs"), Symbol.for("workspace")
 */
export async function bootstrapWorkspace(
  container: Container,
  userDataPath: string,
  logger: Logger
): Promise<WorkspaceService> {
  logger.flow({ domain: "startup", source: "bootstrap", action: "workspace:start" });

  const workspaceFs = createLocalFileSystem();
  const workspaceStoragePath = join(userDataPath, "workspaces.json");
  const workspaceStorage = createJsonStorageAdapter<PersistedWorkspaceState>(
    workspaceStoragePath,
    workspaceFs
  );
  const workspaceSettingsRepo = new WorkspaceSettingsRepository(workspaceStorage);
  const workspaceRegistry = new WorkspaceRegistry(workspaceSettingsRepo, workspaceFs);
  const workspaceService = createWorkspaceService(workspaceRegistry, workspaceFs, { userDataPath });

  await workspaceService.initialize();

  container.singleton(Symbol.for("workspace.fs"), () => workspaceFs);
  container.singleton(Symbol.for("workspace"), () => workspaceService);

  logger.flow({ domain: "startup", source: "bootstrap", action: "workspace:done" });
  return workspaceService;
}
