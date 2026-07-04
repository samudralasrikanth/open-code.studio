import { describe, it, expect, beforeEach } from "vitest";
import { SettingsRegistry } from "../src/application/SettingsRegistry.js";
import { SettingsValidator } from "../src/application/SettingsValidator.js";
import { SettingsService } from "../src/application/SettingsService.js";
import { UserSettingsStore } from "../src/infrastructure/UserSettingsStore.js";
import { WorkspaceSettingsStore } from "../src/infrastructure/WorkspaceSettingsStore.js";
import { SettingScope } from "../src/domain/SettingScope.js";

describe("SettingsService", () => {
  let registry: SettingsRegistry;
  let validator: SettingsValidator;
  let userStore: UserSettingsStore;
  let workspaceStore: WorkspaceSettingsStore;
  let mockEventBus: any;
  let service: SettingsService;

  beforeEach(() => {
    registry = new SettingsRegistry();
    validator = new SettingsValidator();
    userStore = new UserSettingsStore();
    workspaceStore = new WorkspaceSettingsStore();
    mockEventBus = {
      emit: () => {},
      subscribe: () => {}
    };

    registry.register({
      id: "editor.fontSize",
      title: "Font Size",
      description: "Size in px",
      type: "number",
      defaultValue: 14,
      minimum: 6,
      maximum: 72,
      category: "Editor"
    });

    service = new SettingsService(registry, validator, userStore, workspaceStore, mockEventBus);
  });

  it("returns default value when no scope value is set", () => {
    const value = service.get("editor.fontSize");
    expect(value).toBe(14);
  });

  it("validates setting constraints", async () => {
    await expect(service.set("editor.fontSize", 1, SettingScope.User)).rejects.toThrow();
  });
});
