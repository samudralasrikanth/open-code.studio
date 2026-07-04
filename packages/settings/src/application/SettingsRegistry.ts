import type { SettingSchema } from "../domain/SettingSchema.js";

export class SettingsRegistry {
  private schemas = new Map<string, SettingSchema>();

  public register(schema: SettingSchema): void {
    if (this.schemas.has(schema.id)) {
      throw new Error(`Setting schema with id '${schema.id}' is already registered.`);
    }
    this.schemas.set(schema.id, schema);
  }

  public get(id: string): SettingSchema | undefined {
    return this.schemas.get(id);
  }

  public getAll(): SettingSchema[] {
    return Array.from(this.schemas.values());
  }
}
