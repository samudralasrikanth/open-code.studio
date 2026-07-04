import type { GitStatus } from "../domain/GitModels.js";
import { GitCliProvider } from "../infrastructure/GitCliProvider.js";

export class GitService {
  private readonly provider: GitCliProvider;

  constructor(repositoryPath: string) {
    this.provider = new GitCliProvider(repositoryPath);
  }

  public async isRepository(): Promise<boolean> {
    return this.provider.isRepository();
  }

  public async getStatus(): Promise<GitStatus> {
    return this.provider.getStatus();
  }

  public async commit(message: string): Promise<void> {
    await this.provider.commit(message);
  }

  public async add(paths: string[]): Promise<void> {
    await this.provider.add(paths);
  }
}
