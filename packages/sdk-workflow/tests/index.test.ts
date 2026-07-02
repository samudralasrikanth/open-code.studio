import { describe, expect, it } from "vitest";

import { SdkWorkflowPackage } from "../src/index.js";

describe("@ocs/sdk-workflow", () => {
  it("exposes a public package identity", () => {
    expect(SdkWorkflowPackage.name).toBe("@ocs/sdk-workflow");
  });
});
