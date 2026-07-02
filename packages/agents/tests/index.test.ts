import { describe, expect, it } from "vitest";

import { AgentsPackage } from "../src/index.js";

describe("@ocs/agents", () => {
  it("exposes a public package identity", () => {
    expect(AgentsPackage.name).toBe("@ocs/agents");
  });
});
