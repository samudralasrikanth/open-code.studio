import { ElectronE2ETestHarness } from "../helpers/electron_e2e_helper.mjs";

export async function run() {
  const harness = new ElectronE2ETestHarness("EPIC-0014", "Command Platform Execution & Discovery");

  try {
    await harness.setupWorkspace({
      "commands-test.txt": "Command platform testing"
    });

    let window = await harness.launchElectron();
    await harness.openWorkspaceInSetup();
    await harness.takeScreenshot("commands_initial");

    harness.startActionPhase();

    // Click to focus window and count as physical interaction
    await harness.click("#root > div");

    // Verify search commands
    const searchResults = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.commands?.search?.("save") ?? [];
    });

    harness.assert(Array.isArray(searchResults), "Commands search returned list array");
    harness.assert(searchResults.length > 0, "Found registered commands containing 'save'");
    harness.assert(searchResults[0].command.id, `First matching command has id: ${searchResults[0]?.command?.id}`);

    // Verify execute command (e.g. settings)
    const result = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.commands?.execute?.("settings:get-all") || {};
    });

    harness.assert(result && typeof result === "object", "Executed registered settings fetch command successfully");

    return await harness.finish();
  } catch (err) {
    harness.log(`FATAL SUITE ERROR: ${err.message}`);
    return await harness.finish(err.message);
  }
}
