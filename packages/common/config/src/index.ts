import { PlatformError } from "../../errors/src/index.js";
import type { EventBus } from "../../events/src/index.js";

export type ConfigValue = string | number | boolean | null | ConfigObject | ConfigValue[];
export interface ConfigObject {
  readonly [key: string]: ConfigValue;
}

export type ConfigSchema<T extends ConfigObject> = {
  readonly [K in keyof T]-?: (value: unknown) => value is T[K];
};

export interface Secret {
  readonly masked: "********";
  reveal(): string;
}

export function secret(value: string): Secret {
  return {
    masked: "********",
    reveal: () => value
  };
}

export class ConfigurationService<TConfig extends ConfigObject> {
  private config: Readonly<TConfig>;

  public constructor(
    initialConfig: ConfigObject,
    private readonly schema: ConfigSchema<TConfig>,
    private readonly events?: EventBus
  ) {
    this.config = Object.freeze(this.validate(initialConfig));
  }

  public get<K extends keyof TConfig>(key: K): TConfig[K] {
    return this.config[key];
  }

  public snapshot(): Readonly<TConfig> {
    return this.config;
  }

  public async reload(nextConfig: ConfigObject): Promise<void> {
    const previous = this.config;
    this.config = Object.freeze(this.validate(nextConfig));
    await this.events?.publish("configuration.changed", { previous, current: this.config });
  }

  private validate(config: ConfigObject): TConfig {
    const next: Partial<TConfig> = {};
    for (const [key, validator] of Object.entries(this.schema) as [
      keyof TConfig,
      (value: unknown) => boolean
    ][]) {
      const value = config[key as string];
      if (!validator(value)) {
        throw new PlatformError({
          category: "configuration",
          code: "OCS-CONFIG-INVALID",
          message: `Invalid configuration value for ${String(key)}`
        });
      }
      next[key] = value as TConfig[keyof TConfig];
    }
    return next as TConfig;
  }
}

export function parseJsonConfig(source: string): ConfigObject {
  const parsed = JSON.parse(source) as unknown;
  if (!isConfigObject(parsed)) {
    throw new PlatformError({
      category: "configuration",
      code: "OCS-CONFIG-JSON",
      message: "JSON configuration must be an object"
    });
  }
  return parsed;
}

export function parseYamlConfig(source: string): ConfigObject {
  const result: Record<string, ConfigValue> = {};
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const separator = line.indexOf(":");
    if (separator < 1) {
      throw new PlatformError({
        category: "configuration",
        code: "OCS-CONFIG-YAML",
        message: `Invalid YAML configuration line: ${rawLine}`
      });
    }
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    result[key] = coerceConfigValue(value);
  }
  return result;
}

export function loadEnvironmentConfig(
  env: Record<string, string | undefined>,
  prefix = "OCS_"
): ConfigObject {
  return Object.fromEntries(
    Object.entries(env)
      .filter(([key, value]) => key.startsWith(prefix) && value !== undefined)
      .map(([key, value]) => [key.slice(prefix.length).toLowerCase(), value])
  ) as ConfigObject;
}

function coerceConfigValue(value: string): ConfigValue {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
  return value.replace(/^["']|["']$/g, "");
}

function isConfigObject(value: unknown): value is ConfigObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
