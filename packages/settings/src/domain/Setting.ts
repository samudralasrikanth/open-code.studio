import type { SettingSchema } from "./SettingSchema.js";
import type { SettingScope } from "./SettingScope.js";

export interface Setting {
  /** The schema defining this setting */
  schema: SettingSchema;
  /** The effective value of this setting after resolving scopes */
  value: any;
  /** The scope from which the current effective value originated */
  scope: SettingScope;
}
