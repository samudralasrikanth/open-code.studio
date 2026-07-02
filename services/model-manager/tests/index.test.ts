import { describe, expect, it } from "vitest";

import { ServiceModelManagerPackage } from "../src/index.js";

describe("@ocs/service-model-manager", () => {
  it("exposes a public package identity", () => {
    expect(ServiceModelManagerPackage.name).toBe("@ocs/service-model-manager");
  });
});
