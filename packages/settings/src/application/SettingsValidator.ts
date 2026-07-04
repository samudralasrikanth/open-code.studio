import type { SettingSchema } from "../domain/SettingSchema.js";

export class SettingsValidator {
  public validate(schema: SettingSchema, value: any): boolean {
    if (value === undefined || value === null) {
      return false; // null or undefined is generally not valid unless specifically supported
    }

    switch (schema.type) {
      case "string":
        if (typeof value !== "string") return false;
        break;
      case "number":
        if (typeof value !== "number") return false;
        if (schema.minimum !== undefined && value < schema.minimum) return false;
        if (schema.maximum !== undefined && value > schema.maximum) return false;
        break;
      case "boolean":
        if (typeof value !== "boolean") return false;
        break;
      case "array":
        if (!Array.isArray(value)) return false;
        break;
      case "object":
        if (typeof value !== "object" || Array.isArray(value)) return false;
        break;
    }

    if (schema.enum && !schema.enum.includes(value)) {
      return false;
    }

    return true;
  }
}
