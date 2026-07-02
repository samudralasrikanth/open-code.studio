import { describe, expect, it } from "vitest";

import { ServiceUpdateServicePackage } from "../src/index.js";

describe("@ocs/service-update-service", () => {
  it("exposes a public package identity", () => {
    expect(ServiceUpdateServicePackage.name).toBe("@ocs/service-update-service");
  });
});
