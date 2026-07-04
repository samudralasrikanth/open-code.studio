import { ElectronE2ETestHarness } from "../helpers/electron_e2e_helper.mjs";

export async function run() {
  const harness = new ElectronE2ETestHarness("EPIC-0015", "Keyboard Shortcut Platform & Chords");

  try {
    await harness.setupWorkspace({
      "keybindings-test.txt": "Keybindings system testing"
    });

    let window = await harness.launchElectron();
    await harness.openWorkspaceInSetup();
    await harness.takeScreenshot("keybindings_initial");

    harness.startActionPhase();

    // Click to focus window and count as physical interaction
    await harness.click("#root > div");

    // Verify keybindings list returns default shortcuts
    const initialBindings = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.keybindings?.get?.() ?? [];
    });

    harness.assert(Array.isArray(initialBindings), "Keybindings GET returned shortcut list array");
    harness.assert(initialBindings.length > 0, "Found default registered shortcuts (e.g. Save, Command Palette)");

    // Register a user override keybinding
    const customBinding = { key: "Control+Shift+T", command: "workbench.action.toggleTerminal" };
    const updatedBindings = await window.evaluate(async (binding) => {
      // @ts-ignore
      return await window.ocs?.keybindings?.set?.(binding) ?? [];
    }, customBinding);

    const hasCustom = updatedBindings.some(
      (b) => b.key.toLowerCase() === "control+shift+t" && b.command === "workbench.action.toggleTerminal"
    );
    harness.assert(hasCustom, "Successfully registered custom user keybinding override via API");

    return await harness.finish();
  } catch (err) {
    harness.log(`FATAL SUITE ERROR: ${err.message}`);
    return await harness.finish(err.message);
  }
}
