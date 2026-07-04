import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type { GitStatus, GitFileStatus, GitStatusChar } from "../domain/GitModels.js";

const execFileAsync = promisify(execFile);

export class GitCliProvider {
  constructor(private readonly repositoryPath: string) {}

  /**
   * Executes a git command in the repository path.
   */
  public async exec(args: string[]): Promise<string> {
    try {
      const { stdout } = await execFileAsync("git", args, {
        cwd: this.repositoryPath,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024 // 10MB
      });
      return stdout;
    } catch (error: unknown) {
      if (error instanceof Error && "stderr" in error) {
        throw new Error(`Git error: ${String(error.stderr)}`);
      }
      throw error;
    }
  }

  /**
   * Checks if the directory is a git repository.
   */
  public async isRepository(): Promise<boolean> {
    try {
      await this.exec(["rev-parse", "--is-inside-work-tree"]);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Parses `git status --porcelain=v2 --branch`
   */
  public async getStatus(): Promise<GitStatus> {
    const output = await this.exec(["status", "--porcelain=v2", "--branch"]);
    const lines = output.split("\n");

    const status: GitStatus = {
      files: []
    };

    for (const line of lines) {
      if (!line) continue;

      if (line.startsWith("# branch.head")) {
        status.branch = line.split(" ")[2] || "";
      } else if (line.startsWith("# branch.upstream")) {
        status.upstream = line.split(" ")[2] || "";
      } else if (line.startsWith("# branch.ab")) {
        const parts = line.split(" ");
        status.ahead = parseInt(parts[2]?.substring(1) || "0", 10);
        status.behind = parseInt(parts[3]?.substring(1) || "0", 10);
      } else if (line.startsWith("1 ") || line.startsWith("2 ")) {
        const parts = line.split(" ");
        const xy = parts[1]; // e.g. "M.", ".M", "MM"

        let path = "";
        let originalPath: string | undefined = undefined;

        if (line.startsWith("1 ")) {
          // Format 1: 1 <XY> <sub> <mH> <mI> <mW> <hH> <hI> <path>
          path = parts.slice(8).join(" ");
        } else if (line.startsWith("2 ")) {
          // Format 2: 2 <XY> <sub> <mH> <mI> <mW> <hH> <hI> <X><score> <path><sep><origPath>
          const paths = parts.slice(9).join(" ").split("\t");
          path = paths[0] ?? "";
          originalPath = paths[1];
        }

        const safeIndexStatus = xy?.[0] ?? " ";
        const safeWorkTreeStatus = xy?.[1] ?? " ";

        const fileStatus: GitFileStatus = {
          path,
          indexStatus: (safeIndexStatus === "." ? " " : safeIndexStatus) as GitStatusChar,
          workTreeStatus: (safeWorkTreeStatus === "." ? " " : safeWorkTreeStatus) as GitStatusChar
        };
        if (originalPath !== undefined) {
          fileStatus.originalPath = originalPath;
        }
        status.files.push(fileStatus);
      } else if (line.startsWith("? ")) {
        // Untracked files
        const path = line.substring(2);
        status.files.push({
          path,
          indexStatus: "?",
          workTreeStatus: "?"
        });
      } else if (line.startsWith("u ")) {
        // Unmerged (conflicts)
        const parts = line.split(" ");
        const xy = parts[1];
        status.files.push({
          path: parts.slice(10).join(" "),
          indexStatus: (xy?.[0] ?? " ") as GitStatusChar,
          workTreeStatus: (xy?.[1] ?? " ") as GitStatusChar
        });
      }
    }

    return status;
  }

  public async commit(message: string): Promise<void> {
    await this.exec(["commit", "-m", message]);
  }

  public async add(paths: string[]): Promise<void> {
    await this.exec(["add", ...paths]);
  }
}
