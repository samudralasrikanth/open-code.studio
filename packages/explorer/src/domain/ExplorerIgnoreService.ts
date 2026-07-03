export const DEFAULT_IGNORE_PATTERNS = [".DS_Store", "Thumbs.db", "__MACOSX"];

export class ExplorerIgnoreService {
  private ignores: Set<string>;

  constructor(customIgnores: string[] = []) {
    this.ignores = new Set([...DEFAULT_IGNORE_PATTERNS, ...customIgnores]);
  }

  public shouldIgnore(name: string): boolean {
    return this.ignores.has(name);
  }
}
