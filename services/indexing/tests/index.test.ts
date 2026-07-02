import { describe, expect, it } from "vitest";

import { ServiceIndexingPackage } from "../src/index.js";

describe("@ocs/service-indexing", () => {
  it("exposes a public package identity", () => {
    expect(ServiceIndexingPackage.name).toBe("@ocs/service-indexing");
  });
});
