// Lightweight typed IPC contracts used by main <-> renderer IPC handlers.
// This file intentionally contains minimal, well-named types to improve
// discoverability and to be expanded during Phase 1 work.

export type CommandArgs = Record<string, any> | undefined;

export interface CommandRequest {
  id: string;
  args?: CommandArgs;
}

export interface CommandResult {
  success: boolean;
  result?: any;
  error?: string;
}

export interface WorkspaceOpenArgs {
  uri: string;
}

export interface RecentEntry {
  label: string;
  path: string;
}

export interface WorkspaceState {
  workspaceFolder?: string;
  recent: RecentEntry[];
}

export const IPCChannels = {
  commands: {
    execute: "commands:execute",
    search: "commands:search"
  },
  workspace: {
    open: "workspace:open",
    getRecent: "workspace:getRecent",
    state: "workspace:state"
  }
} as const;

export type IPCChannelsType = typeof IPCChannels;

export default IPCChannels;
