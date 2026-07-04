export interface GitRepository {
  path: string;
  isBare: boolean;
}

export interface GitBranch {
  name: string;
  isCurrent: boolean;
  upstream?: string;
}

export type GitStatusChar = " " | "M" | "A" | "D" | "R" | "C" | "U" | "?" | "!";

export interface GitFileStatus {
  path: string;
  originalPath?: string; // Set for renamed/copied files
  indexStatus: GitStatusChar;
  workTreeStatus: GitStatusChar;
}

export interface GitStatus {
  branch?: string;
  upstream?: string;
  ahead?: number;
  behind?: number;
  files: GitFileStatus[];
}

export interface GitCommit {
  id: string;
  message: string;
  author: string;
  date: string;
}
