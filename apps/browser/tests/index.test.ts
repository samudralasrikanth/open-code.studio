import { describe, expect, it } from "vitest";

import { AppBrowserPackage } from "../src/index.js";

describe("@ocs/app-browser", () => {
  it("exposes a public package identity", () => {
    expect(AppBrowserPackage.name).toBe("@ocs/app-browser");
  });
});
