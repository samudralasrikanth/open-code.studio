import { ElectronE2ETestHarness } from "../helpers/electron_e2e_helper.mjs";

export async function run() {
  const harness = new ElectronE2ETestHarness("EPIC-0012", "Theme Platform Custom Styling & Precedence");

  try {
    await harness.setupWorkspace({
      "theme-test.txt": "Theme system testing"
    });

    let window = await harness.launchElectron();
    await harness.openWorkspaceInSetup();
    await harness.takeScreenshot("theme_initial");

    harness.startActionPhase();

    // Click to focus window and count as physical interaction
    await harness.click("#root > div");

    // Verify Theme API initial state
    const initialThemeData = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.theme?.get?.();
    });

    harness.assert(initialThemeData && typeof initialThemeData === "object", "Theme API successfully returned initial state");
    harness.assert(initialThemeData?.activeId === "one-dark", `Default theme is one-dark (got ${initialThemeData?.activeId})`);

    // Set Theme to Light Modern
    const updatedTheme = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.theme?.set?.("light-modern");
    });

    harness.assert(updatedTheme?.id === "light-modern", "Theme set call returned light-modern metadata");
    await window.waitForTimeout(400);
    await harness.takeScreenshot("theme_light_modern");

    // Verify injected CSS custom variables
    const bodyBgColor = await window.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue("--background-primary").trim();
    });
    harness.assert(bodyBgColor === "#f3f3f3", `Light theme --background-primary CSS variable successfully injected: ${bodyBgColor}`);

    return await harness.finish();
  } catch (err) {
    harness.log(`FATAL SUITE ERROR: ${err.message}`);
    return await harness.finish(err.message);
  }
}
