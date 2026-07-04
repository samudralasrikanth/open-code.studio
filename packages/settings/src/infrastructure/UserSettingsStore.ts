import * as path from "path";
import * as os from "os";
import { JsonSettingsStore } from "./JsonSettingsStore.js";

export class UserSettingsStore {
  private store: JsonSettingsStore;

  constructor() {
    // ~/.open-code/settings.json
    const userSettingsPath = path.join(os.homedir(), ".open-code", "settings.json");
    this.store = new JsonSettingsStore(userSettingsPath);
  }

  public async load(): Promise<Record<string, any>> {
    return this.store.load();
  }

  public async save(data: Record<string, any>): Promise<void> {
    return this.store.save(data);
  }
}
