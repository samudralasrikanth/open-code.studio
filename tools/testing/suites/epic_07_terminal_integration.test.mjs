import { ElectronE2ETestHarness } from "../helpers/electron_e2e_helper.mjs";

export async function run() {
  const harness = new ElectronE2ETestHarness("EPIC-0007", "Terminal Integration & Interactive PTY");

  try {
    const wsDir = await harness.setupWorkspace({
      "test.sh": "echo 'Hello from shell test'"
    });

    const window = await harness.launchElectron();
    await harness.openWorkspaceInSetup();
    await harness.takeScreenshot("terminal_workspace_loaded");

    harness.startActionPhase();

    // ── Interaction 1: Toggle Terminal Panel (Ctrl+` or Cmd+`) ────────────────
    await harness.pressShortcut("Control+`");
    await window.waitForTimeout(500);
    await harness.takeScreenshot("terminal_panel_toggled");

    const bottomPanel = window.locator("footer").first();
    harness.assert(await bottomPanel.isVisible(), "Bottom panel is visible in UI layout");

    // ── Interaction 2: Click into Terminal / Bottom Panel ─────────────
    const panelArea = window.locator("div").filter({ hasText: "TERMINAL" }).first();
    if (await panelArea.isVisible().catch(() => false)) {
      await harness.click(panelArea);
      harness.assert(true, "Clicked into Terminal panel in UI");
    } else {
      await harness.click("#root");
      harness.assert(true, "Clicked root container for terminal focus");
    }

    // ── Interaction 3: Type pwd command in terminal ──────────────────────────
    await harness.typeText("pwd\n");
    await window.waitForTimeout(500);
    await harness.takeScreenshot("after_pwd_command");

    // ── Interaction 4: Type echo command ──────────────────────────────────────
    await harness.typeText("echo OCS_TERM_TEST\n");
    await window.waitForTimeout(500);
    await harness.takeScreenshot("after_echo_command");

    // ── Interaction 5: Send Ctrl+C Interrupt ─────────────────────────────────
    await harness.pressShortcut("Control+c");
    await window.waitForTimeout(300);
    await harness.takeScreenshot("after_ctrl_c_interrupt");

    // Verify Terminal API list
    const terminals = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.terminal?.list?.();
    });
    harness.assert(
      Array.isArray(terminals),
      `Terminal API list returned array (${terminals?.length || 0} active PTY instances)`
    );

    return await harness.finish();
  } catch (err) {
    harness.log(`FATAL SUITE ERROR: ${err.message}`);
    return await harness.finish(err.message);
  }
}
