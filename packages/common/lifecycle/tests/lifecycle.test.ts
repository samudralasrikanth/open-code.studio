import { describe, expect, it } from "vitest";

import { createLifecycleManager, type LifecycleService } from "../src/index.js";

function service(
  name: string,
  calls: string[],
  dependsOn: readonly string[] = []
): LifecycleService {
  return {
    name,
    dependsOn,
    start: () => calls.push(`start:${name}`),
    stop: () => calls.push(`stop:${name}`)
  };
}

describe("LifecycleManager", () => {
  it("starts in dependency order and stops in reverse order", async () => {
    const calls: string[] = [];
    const lifecycle = createLifecycleManager()
      .register(service("database", calls))
      .register(service("api", calls, ["database"]));

    await lifecycle.start();
    await lifecycle.stop();

    expect(calls).toEqual(["start:database", "start:api", "stop:api", "stop:database"]);
  });

  it("shuts down started services when startup fails", async () => {
    const calls: string[] = [];
    const lifecycle = createLifecycleManager()
      .register(service("ready", calls))
      .register({
        name: "broken",
        dependsOn: ["ready"],
        start: () => {
          throw new Error("boom");
        },
        stop: () => calls.push("stop:broken")
      });

    await expect(lifecycle.start()).rejects.toThrow(/startup failed/);
    expect(calls).toEqual(["start:ready", "stop:ready"]);
  });

  it("reports health and rejects missing or circular dependencies", async () => {
    const calls: string[] = [];
    const healthy = createLifecycleManager().register({
      ...service("healthy", calls),
      health: () => ({ healthy: true, message: "ok" })
    });

    await expect(healthy.health()).resolves.toEqual({ healthy: { healthy: true, message: "ok" } });
    await expect(
      createLifecycleManager()
        .register(service("api", calls, ["missing"]))
        .start()
    ).rejects.toThrow(/startup failed/);
    await expect(
      createLifecycleManager()
        .register(service("a", calls, ["b"]))
        .register(service("b", calls, ["a"]))
        .start()
    ).rejects.toThrow(/startup failed/);
  });
});
