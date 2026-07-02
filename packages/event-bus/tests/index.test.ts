import { describe, expect, it } from "vitest";

import { EventBusPackage } from "../src/index.js";

describe("@ocs/event-bus", () => {
  it("exposes a public package identity", () => {
    expect(EventBusPackage.name).toBe("@ocs/event-bus");
  });
});
