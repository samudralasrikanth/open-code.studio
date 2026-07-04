import { ElectronE2ETestHarness } from "../helpers/electron_e2e_helper.mjs";

export async function run() {
  const harness = new ElectronE2ETestHarness("EPIC-0002", "Core Platform Services & Event Bus");

  try {
    await harness.setupWorkspace({ "core.txt": "Core Platform Test" });
    const window = await harness.launchElectron();

    await harness.openWorkspaceInSetup();
    await harness.takeScreenshot("core_platform_loaded");

    harness.startActionPhase();

    // Interaction 1: Click Status Bar to trigger UI event bus update
    const statusBar = window.locator("footer").first();
    harness.assert(await statusBar.isVisible(), "Status Bar is visible in UI layout");
    await harness.click(statusBar);

    // Interaction 2: Click Activity Bar items (Explorer vs Search vs Settings)
    const explorerBtn = window.locator('button[title="Explorer"]').first();
    if (await explorerBtn.isVisible().catch(() => false)) {
      await harness.click(explorerBtn);
      await harness.takeScreenshot("activity_bar_explorer_clicked");
    } else {
      await harness.click("#root");
    }

    // Verify IPC Health Check endpoint
    const health = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.health?.check();
    });
    harness.assert(
      health && health.status === "ok",
      `IPC Health Check returned status ok (${health?.status})`
    );

    // Verify Platform Info endpoint
    const platformInfo = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.health?.platformInfo();
    });
    harness.assert(
      platformInfo && platformInfo.platform,
      `IPC Platform Info returned platform (${platformInfo?.platform})`
    );

    // Verify Theme API endpoint
    const currentTheme = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.theme?.get();
    });
    harness.assert(
      typeof currentTheme === "string",
      `Theme API returned current theme ("${currentTheme}")`
    );

    return await harness.finish();
  } catch (err) {
    harness.log(`FATAL SUITE ERROR: ${err.message}`);
    return await harness.finish(err.message);
  }
}
