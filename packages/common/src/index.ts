export * from "../config/src/index.js";
export * from "../di/src/index.js";
export * from "../errors/src/index.js";
export * from "../events/src/index.js";
export * from "../lifecycle/src/index.js";
export * from "./commands/CommandRegistry.js";
export * from "./commands/CommandIds.js";
export * from "../logger/src/index.js";
export * from "../telemetry/src/index.js";

// Domain
export * from "./domain/URI.js";
export * from "./domain/CancellationToken.js";
export * from "./domain/Resource.js";

// API
export * from "./api/IResourceService.js";

// Application Services
export * from "./application/ContributionRegistry.js";
export * from "./application/WorkbenchTransactionManager.js";
export * from "./application/WorkbenchSelectionService.js";
export * from "./application/DragDropService.js";
export * from "./application/RenameService.js";
export * from "./application/WorkbenchDialogService.js";

export const CommonPackage = {
  name: "@ocs/common",
  description: "Shared common types and utilities."
} as const;
