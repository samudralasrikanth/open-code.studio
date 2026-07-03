export * from "../config/src/index.js";
export * from "../di/src/index.js";
export * from "../errors/src/index.js";
export * from "../events/src/index.js";
export * from "../lifecycle/src/index.js";
export * from "./commands/CommandRegistry.js";
export * from "./commands/CommandIds.js";
export * from "../logger/src/index.js";
export * from "../telemetry/src/index.js";

export const CommonPackage = {
  name: "@ocs/common",
  description: "Shared common types and utilities."
} as const;
