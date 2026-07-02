import { describe, expect, it } from "vitest";

import { PlatformError, recoverableError, serializeError } from "../src/index.js";

describe("PlatformError", () => {
  it("serializes public error information", () => {
    const error = new PlatformError({
      category: "validation",
      code: "OCS-TEST",
      message: "Invalid",
      details: { internal: true }
    });

    expect(serializeError(error)).toEqual({
      category: "validation",
      code: "OCS-TEST",
      message: "Invalid",
      recoverable: false
    });
  });

  it("marks recoverable errors", () => {
    expect(
      recoverableError({ category: "events", code: "OCS-RETRY", message: "Retry" }).recoverable
    ).toBe(true);
  });

  it("serializes exposed details and unknown errors", () => {
    const exposed = new PlatformError({
      category: "validation",
      code: "OCS-DETAILS",
      message: "Detailed",
      details: { field: "name" },
      exposeDetails: true
    });

    expect(serializeError(exposed).details).toEqual({ field: "name" });
    expect(serializeError("bad")).toEqual({
      category: "unknown",
      code: "OCS-UNKNOWN",
      message: "Unknown error",
      recoverable: false
    });
  });
});
