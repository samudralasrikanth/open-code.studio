import { describe, expect, it } from "vitest";

import { createEventBus } from "../../events/src/index.js";
import {
  ConfigurationService,
  loadEnvironmentConfig,
  parseJsonConfig,
  parseYamlConfig,
  secret
} from "../src/index.js";

interface TestConfig {
  readonly port: number;
  readonly name: string;
}

const schema = {
  port: (value: unknown): value is number => typeof value === "number",
  name: (value: unknown): value is string => typeof value === "string"
};

describe("ConfigurationService", () => {
  it("validates and returns typed configuration", () => {
    const config = new ConfigurationService<TestConfig>({ port: 3000, name: "studio" }, schema);

    expect(config.get("port")).toBe(3000);
    expect(
      () => new ConfigurationService<TestConfig>({ port: "bad", name: "studio" }, schema)
    ).toThrow(/Invalid configuration/);
  });

  it("loads JSON, YAML, and environment values", () => {
    expect(parseJsonConfig('{"port":3000}')).toEqual({ port: 3000 });
    expect(parseYamlConfig("port: 3000\nname: studio")).toEqual({ port: 3000, name: "studio" });
    expect(loadEnvironmentConfig({ OCS_PORT: "3000", HOME: "/tmp" })).toEqual({ port: "3000" });
  });

  it("rejects invalid JSON and YAML sources", () => {
    expect(() => parseJsonConfig("[1,2,3]")).toThrow(/must be an object/);
    expect(() => parseYamlConfig("not-yaml")).toThrow(/Invalid YAML/);
  });

  it("publishes change events when reloaded", async () => {
    const events = createEventBus();
    const received: unknown[] = [];
    events.subscribe("configuration.changed", (event) => received.push(event.payload));
    const config = new ConfigurationService<TestConfig>(
      { port: 3000, name: "studio" },
      schema,
      events
    );

    await config.reload({ port: 3001, name: "studio" });

    expect(config.get("port")).toBe(3001);
    expect(received).toHaveLength(1);
  });

  it("abstracts secrets", () => {
    const value = secret("real-value");

    expect(value.masked).toBe("********");
    expect(value.reveal()).toBe("real-value");
  });
});
