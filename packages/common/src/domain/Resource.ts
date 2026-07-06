import { URI } from "./URI.js";

export enum ResourceType {
  File = 1,
  Folder = 2,
  Symlink = 3,
  GitItem = 4,
  VirtualFile = 5,
  AIDocument = 6,
  Unknown = 99
}

export interface Resource {
  readonly uri: URI;
  readonly type: ResourceType;
  readonly name: string;
  readonly isReadonly: boolean;
  readonly size?: number;
  readonly mtime?: number;
}

export interface ResourceChange {
  type: "added" | "deleted" | "changed" | "moved" | "renamed";
  uri: URI;
  oldUri?: URI; // For moved/renamed
}
