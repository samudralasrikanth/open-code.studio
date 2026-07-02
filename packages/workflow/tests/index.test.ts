import { describe, expect, it } from "vitest";

import { WorkflowPackage } from "../src/index.js";

describe("@ocs/workflow", () => {
  it("exposes a public package identity", () => {
    expect(WorkflowPackage.name).toBe("@ocs/workflow");
  });
});
