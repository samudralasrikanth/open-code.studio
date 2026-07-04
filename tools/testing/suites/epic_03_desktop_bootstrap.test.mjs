import { ElectronE2ETestHarness } from "../helpers/electron_e2e_helper.mjs";

export async function run() {
  const harness = new ElectronE2ETestHarness(
    "EPIC-0003",
    "Desktop Bootstrap Shell & Window Controls"
  );

  try {
    await harness.setupWorkspace({ "bootstrap.txt": "Desktop Bootstrap" });
    const window = await harness.launchElectron();

    await harness.takeScreenshot("initial_desktop_shell");

    harness.startActionPhase();

    // Interaction 1: Toggle Sidebar via Cmd+B / Ctrl+B
    await harness.pressShortcut("Meta+b");
    await window.waitForTimeout(300);
    await harness.takeScreenshot("sidebar_toggled_hidden");

    // Interaction 2: Toggle Sidebar back via Cmd+B / Ctrl+B
    await harness.pressShortcut("Meta+b");
    await window.waitForTimeout(300);
    await harness.takeScreenshot("sidebar_toggled_visible");

    // Interaction 3: Click Header Title Bar
    const header = window.locator("header").first();
    harness.assert(await header.isVisible(), "Header TitleBar is visible");
    await harness.click(header);

    // Verify window state API
    const isMaximized = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.window?.isMaximized();
    });
    harness.assert(
      typeof isMaximized === "boolean",
      `Window isMaximized API returned ${isMaximized}`
    );

    // Verify TitleBar contains app title
    const headerText = await header.innerText();
    harness.assert(
      headerText.includes("Open-Code.Studio"),
      `TitleBar contains application name ("${headerText}")`
    );

    return await harness.finish();
  } catch (err) {
    harness.log(`FATAL SUITE ERROR: ${err.message}`);
    return await harness.finish(err.message);
  }
}
