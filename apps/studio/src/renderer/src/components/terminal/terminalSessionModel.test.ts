import { describe, expect, it } from "vitest";

import { getDisplayTerminalName, getNextActiveSessionId } from "./terminalSessionModel.js";

describe("terminal session helpers", () => {
  it("uses the provided session name and falls back to Terminal", () => {
    expect(getDisplayTerminalName("zsh")).toBe("zsh");
    expect(getDisplayTerminalName(undefined)).toBe("Terminal");
  });

  it("derives a friendly name from the resolved shell path", () => {
    expect(getDisplayTerminalName("terminal", "/bin/zsh")).toBe("zsh");
    expect(getDisplayTerminalName(undefined, "/usr/local/bin/bash")).toBe("bash");
  });

  it("selects the most recently added remaining session after closing the active one", () => {
    const sessions = [
      { id: "one", name: "one", buffer: "", exited: false },
      { id: "two", name: "two", buffer: "", exited: false },
      { id: "three", name: "three", buffer: "", exited: false }
    ];

    expect(getNextActiveSessionId(sessions, "two")).toBe("three");
    expect(getNextActiveSessionId(sessions, "three")).toBe("two");
    expect(getNextActiveSessionId([sessions[0], sessions[1]], "one")).toBe("two");
  });

  it("returns no active session after closing the only terminal", () => {
    expect(
      getNextActiveSessionId([{ id: "one", name: "one", buffer: "", exited: false }], "one")
    ).toBeNull();
  });
});
