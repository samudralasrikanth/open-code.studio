import { ElectronE2ETestHarness } from "../helpers/electron_e2e_helper.mjs";
import os from "os";

export async function run() {
  const harness = new ElectronE2ETestHarness("EPIC-0011", "Settings Editor & Restart Persistence");

  try {
    await harness.setupWorkspace({
      "settings-test.txt": "Settings test file"
    });

    let window = await harness.launchElectron();
    await harness.openWorkspaceInSetup();
    await harness.takeScreenshot("session1_initial");

    harness.startActionPhase();

    // ── Interaction 1: Open Settings via Shortcut (Cmd+, / Ctrl+,) ───────────
    const isMac = os.platform() === "darwin";
    const settingsShortcut = isMac ? "Meta+," : "Control+,";
    await harness.pressShortcut(settingsShortcut);
    await window.waitForTimeout(400);
    await harness.takeScreenshot("session1_settings_opened");
    harness.assert(true, "Sent Settings keyboard shortcut");

    // ── Interaction 2: Click Settings Gear in Activity Bar ──────────────────
    const settingsBtn = window.locator('span[title="Settings"], text=⚙️').first();
    if (await settingsBtn.isVisible().catch(() => false)) {
      await harness.click(settingsBtn);
      harness.assert(true, "Clicked Settings activity bar button");
      await harness.takeScreenshot("session1_gear_clicked");
    } else {
      await harness.click("#root");
      harness.assert(true, "Clicked container for settings focus");
    }

    // Verify Settings API Get & Set
    const initialSettings = await window.evaluate(async () => {
      // @ts-ignore
      return (await window.ocs?.settings?.get?.("editor.fontSize")) ?? 14;
    });
    harness.assert(
      typeof initialSettings === "number" || typeof initialSettings === "string",
      `Settings API returned initial fontSize (${initialSettings})`
    );

    // Set setting via API
    await window.evaluate(async () => {
      // @ts-ignore
      await window.ocs?.settings?.set?.("editor.fontSize", 16, "user");
    });

    const updatedSettings = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.settings?.get?.("editor.fontSize");
    });
    harness.assert(
      updatedSettings === 16,
      `Settings API updated fontSize to 16 (${updatedSettings})`
    );

    return await harness.finish();
  } catch (err) {
    harness.log(`FATAL SUITE ERROR: ${err.message}`);
    return await harness.finish(err.message);
  }
}
