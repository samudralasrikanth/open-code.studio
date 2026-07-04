import type { EventBus } from "@ocs/common";
import { SettingScope } from "../domain/SettingScope.js";
import type { SettingsRegistry } from "./SettingsRegistry.js";
import type { SettingsValidator } from "./SettingsValidator.js";
import type { UserSettingsStore } from "../infrastructure/UserSettingsStore.js";
import type { WorkspaceSettingsStore } from "../infrastructure/WorkspaceSettingsStore.js";

export class SettingsService {
  private userSettingsCache: Record<string, any> = {};
  private workspaceSettingsCache: Record<string, any> = {};

  constructor(
    private registry: SettingsRegistry,
    private validator: SettingsValidator,
    private userStore: UserSettingsStore,
    private workspaceStore: WorkspaceSettingsStore,
    private eventBus: EventBus
  ) {}

  public async load(): Promise<void> {
    this.userSettingsCache = await this.userStore.load();
    this.workspaceSettingsCache = await this.workspaceStore.load();

    // Prune invalid settings from caches optionally, or just leave them.
    // We will validate on get().
    this.eventBus.publish("settings.loaded", {});
  }

  public get(id: string): any {
    const schema = this.registry.get(id);
    if (!schema) {
      return undefined; // Or throw Error
    }

    // Resolve priority: Workspace -> User -> Default
    const workspaceVal = this.workspaceSettingsCache[id];
    if (workspaceVal !== undefined && this.validator.validate(schema, workspaceVal)) {
      return workspaceVal;
    }

    const userVal = this.userSettingsCache[id];
    if (userVal !== undefined && this.validator.validate(schema, userVal)) {
      return userVal;
    }

    return schema.defaultValue;
  }

  public async set(id: string, value: any, scope: SettingScope): Promise<void> {
    const schema = this.registry.get(id);
    if (!schema) {
      throw new Error(`Setting '${id}' is not registered.`);
    }

    if (!this.validator.validate(schema, value)) {
      this.eventBus.publish("settings.validationFailed", { id, value });
      throw new Error(`Invalid value for setting '${id}'.`);
    }

    if (scope === SettingScope.WORKSPACE) {
      this.workspaceSettingsCache[id] = value;
      await this.workspaceStore.save(this.workspaceSettingsCache);
    } else if (scope === SettingScope.USER) {
      this.userSettingsCache[id] = value;
      await this.userStore.save(this.userSettingsCache);
    } else {
      throw new Error(`Cannot set setting '${id}' at scope '${scope}'.`);
    }

    this.eventBus.publish("settings.changed", { id, value, scope });
  }

  public async reset(id: string, scope: SettingScope): Promise<void> {
    const schema = this.registry.get(id);
    if (!schema) {
      throw new Error(`Setting '${id}' is not registered.`);
    }

    if (scope === SettingScope.WORKSPACE) {
      delete this.workspaceSettingsCache[id];
      await this.workspaceStore.save(this.workspaceSettingsCache);
    } else if (scope === SettingScope.USER) {
      delete this.userSettingsCache[id];
      await this.userStore.save(this.userSettingsCache);
    } else {
      throw new Error(`Cannot reset setting '${id}' at scope '${scope}'.`);
    }

    this.eventBus.publish("settings.reset", { id, scope });

    // Publish changed event to notify the resolved value update
    const resolvedValue = this.get(id);
    this.eventBus.publish("settings.changed", { id, value: resolvedValue, scope: "resolved" });
  }

  public getAllResolved(): Record<string, any> {
    const schemas = this.registry.getAll();
    const result: Record<string, any> = {};
    for (const schema of schemas) {
      result[schema.id] = this.get(schema.id);
    }
    return result;
  }
}
