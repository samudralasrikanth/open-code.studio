import { describe, expect, it } from "vitest";

import { createContainer, createServiceToken } from "../src/index.js";

describe("Container", () => {
  it("resolves singleton and transient services", () => {
    const singletonToken = createServiceToken<{ readonly id: number }>("singleton");
    const transientToken = createServiceToken<{ readonly id: number }>("transient");
    let id = 0;
    const container = createContainer()
      .singleton(singletonToken, () => ({ id: ++id }))
      .transient(transientToken, () => ({ id: ++id }));

    expect(container.resolve(singletonToken)).toBe(container.resolve(singletonToken));
    expect(container.resolve(transientToken)).not.toBe(container.resolve(transientToken));
  });

  it("supports lazy service resolution", () => {
    const token = createServiceToken<string>("lazy");
    const container = createContainer().singleton(token, () => "resolved");

    expect(container.lazy(token)()).toBe("resolved");
  });

  it("fails safely for unknown and circular dependencies", () => {
    const a = createServiceToken<string>("a");
    const b = createServiceToken<string>("b");
    const unknown = createServiceToken<string>("unknown");
    const container = createContainer()
      .singleton(a, (resolver) => resolver.resolve(b))
      .singleton(b, (resolver) => resolver.resolve(a));

    expect(() => container.resolve(unknown)).toThrow(/not registered/);
    expect(() => container.resolve(a)).toThrow(/Circular dependency/);
  });

  it("rejects duplicate registrations", () => {
    const token = createServiceToken<string>("duplicate");
    const container = createContainer().singleton(token, () => "first");

    expect(() => container.singleton(token, () => "second")).toThrow(/already registered/);
  });
});
