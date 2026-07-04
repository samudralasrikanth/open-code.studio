import { GitService } from "@ocs/git";

let gitServiceInstance: GitService | null = null;

export function bootstrapGit(workspacePath: string): void {
  gitServiceInstance = new GitService(workspacePath);
}

export function getGitService(): GitService {
  if (!gitServiceInstance) {
    throw new Error("GitService has not been bootstrapped yet.");
  }
  return gitServiceInstance;
}
