import { describe, expect, it } from "vitest";

import { KnowledgePackage } from "../src/index.js";

describe("@ocs/knowledge", () => {
  it("exposes a public package identity", () => {
    expect(KnowledgePackage.name).toBe("@ocs/knowledge");
  });
});
