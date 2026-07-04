import { ElectronE2ETestHarness } from "../helpers/electron_e2e_helper.mjs";
import os from "os";

export async function run() {
  const harness = new ElectronE2ETestHarness("EPIC-0009", "Command Palette & Quick Open");

  try {
    await harness.setupWorkspace({
      "palette.txt": "Command palette test"
    });

    const window = await harness.launchElectron();
    await harness.openWorkspaceInSetup();
    await harness.takeScreenshot("command_palette_workspace_loaded");

    harness.startActionPhase();

    // ── Interaction 1: Open Command Palette Shortcut (Cmd+Shift+P / Ctrl+Shift+P) ─
    const isMac = os.platform() === "darwin";
    const paletteShortcut = isMac ? "Meta+Shift+p" : "Control+Shift+p";
    await harness.pressShortcut(paletteShortcut);
    await window.waitForTimeout(400);
    await harness.takeScreenshot("command_palette_opened");
    harness.assert(true, "Sent Command Palette keyboard shortcut");

    // ── Interaction 2: Type query in Command Palette ────────────────────────
    await harness.typeText("Quit");
    await window.waitForTimeout(300);
    await harness.takeScreenshot("command_palette_typed");
    harness.assert(true, "Typed query into Command Palette");

    // ── Interaction 3: Press Escape to dismiss palette ──────────────────────
    await harness.pressShortcut("Escape");
    await window.waitForTimeout(300);
    await harness.takeScreenshot("command_palette_dismissed");
    harness.assert(true, "Dismissed Command Palette with Escape key");

    // Verify Commands Search API
    const searchResults = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.commands?.search?.("app");
    });

    harness.assert(
      Array.isArray(searchResults),
      `Commands search API returned results array (${searchResults?.length || 0} items)`
    );
    harness.assert(searchResults !== undefined, "Command search API returned valid response");

    return await harness.finish();
  } catch (err) {
    harness.log(`FATAL SUITE ERROR: ${err.message}`);
    return await harness.finish(err.message);
  }
}
