import { describe, expect, it } from "vitest";

import { WorkspaceStateMachine } from "../src/domain/WorkspaceState.js";

describe("WorkspaceStateMachine", () => {
  it("starts in the closed state", () => {
    const sm = new WorkspaceStateMachine();
    expect(sm.value).toBe("closed");
    expect(sm.is("closed")).toBe(true);
  });

  it("allows closed → opening", () => {
    const sm = new WorkspaceStateMachine();
    sm.transition("opening");
    expect(sm.value).toBe("opening");
  });

  it("allows opening → open", () => {
    const sm = new WorkspaceStateMachine();
    sm.transition("opening");
    sm.transition("open");
    expect(sm.value).toBe("open");
  });

  it("allows opening → failed", () => {
    const sm = new WorkspaceStateMachine();
    sm.transition("opening");
    sm.transition("failed");
    expect(sm.value).toBe("failed");
  });

  it("allows failed → closed", () => {
    const sm = new WorkspaceStateMachine();
    sm.transition("opening");
    sm.transition("failed");
    sm.transition("closed");
    expect(sm.value).toBe("closed");
  });

  it("allows failed → opening (retry without an intermediate close)", () => {
    const sm = new WorkspaceStateMachine();
    sm.transition("opening");
    sm.transition("failed");
    expect(() => sm.transition("opening")).not.toThrow();
    expect(sm.value).toBe("opening");
  });

  it("allows the full open/close cycle", () => {
    const sm = new WorkspaceStateMachine();
    sm.transition("opening");
    sm.transition("open");
    sm.transition("closing");
    sm.transition("closed");
    expect(sm.value).toBe("closed");
  });

  it("throws on invalid transition: closed → open", () => {
    const sm = new WorkspaceStateMachine();
    expect(() => sm.transition("open")).toThrow("Invalid workspace state transition");
  });

  it("throws on invalid transition: open → opening", () => {
    const sm = new WorkspaceStateMachine();
    sm.transition("opening");
    sm.transition("open");
    expect(() => sm.transition("opening")).toThrow("Invalid workspace state transition");
  });

  describe("tryTransition", () => {
    it("returns true on a valid transition", () => {
      const sm = new WorkspaceStateMachine();
      expect(sm.tryTransition("opening")).toBe(true);
      expect(sm.value).toBe("opening");
    });

    it("returns false on an invalid transition without throwing", () => {
      const sm = new WorkspaceStateMachine();
      expect(sm.tryTransition("open")).toBe(false);
      expect(sm.value).toBe("closed"); // unchanged
    });
  });
});
