import * as fs from "fs/promises";
import * as path from "path";

export class JsonSettingsStore {
  constructor(private filePath: string) {}

  public async load(): Promise<Record<string, any>> {
    try {
      const content = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(content);
    } catch (err: any) {
      if (err.code === "ENOENT") {
        return {};
      }
      throw new Error(`Failed to load settings from ${this.filePath}: ${err.message}`);
    }
  }

  public async save(data: Record<string, any>): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err: any) {
      throw new Error(`Failed to save settings to ${this.filePath}: ${err.message}`);
    }
  }
}
