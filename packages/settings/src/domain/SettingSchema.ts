export type SettingType = "string" | "number" | "boolean" | "object" | "array";

export interface SettingSchema {
  /** The unique identifier for the setting (e.g., `editor.fontSize`) */
  id: string;
  /** The type of the setting */
  type: SettingType;
  /** A human-readable title */
  title: string;
  /** A detailed description */
  description: string;
  /** The default value */
  defaultValue: any;
  /** If type is string/number, the allowed values */
  enum?: any[];
  /** Optional minimum value for numbers */
  minimum?: number;
  /** Optional maximum value for numbers */
  maximum?: number;
  /** Optional category for grouping in the UI */
  category?: string;
}
