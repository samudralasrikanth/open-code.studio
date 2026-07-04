import * as path from "path";
import { JsonSettingsStore } from "./JsonSettingsStore.js";

export class WorkspaceSettingsStore {
  private store: JsonSettingsStore | null = null;

  public initialize(workspacePath: string): void {
    const settingsPath = path.join(workspacePath, ".ocs", "settings.json");
    this.store = new JsonSettingsStore(settingsPath);
  }

  public async load(): Promise<Record<string, any>> {
    if (!this.store) return {};
    return this.store.load();
  }

  public async save(data: Record<string, any>): Promise<void> {
    if (!this.store) {
      throw new Error("WorkspaceSettingsStore is not initialized with a workspace path.");
    }
    return this.store.save(data);
  }
}
