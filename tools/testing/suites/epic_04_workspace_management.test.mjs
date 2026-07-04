import { ElectronE2ETestHarness } from "../helpers/electron_e2e_helper.mjs";

export async function run() {
  const harness = new ElectronE2ETestHarness("EPIC-0004", "Workspace Management & Lifecycle");

  try {
    const wsDir = await harness.setupWorkspace({
      "file1.txt": "Workspace file 1 content",
      "file2.js": "console.log('workspace file 2');"
    });

    const window = await harness.launchElectron();

    await harness.openWorkspaceInSetup();
    await harness.takeScreenshot("workspace_opened");

    harness.startActionPhase();

    // Interaction 1: Click Explorer Panel header to focus workspace
    const explorerHeader = window.locator('text=EXPLORER').first();
    if (await explorerHeader.isVisible().catch(() => false)) {
      await harness.click(explorerHeader);
    } else {
      await harness.click("#root");
    }

    // Interaction 2: Click on tree item file
    const treeItem = window.locator('[role="treeitem"]').first();
    harness.assert(await treeItem.isVisible(), "Workspace file tree items are visible in sidebar");
    await harness.click(treeItem);
    await harness.takeScreenshot("workspace_treeitem_clicked");

    // Verify Active Workspace via API
    const activeWs = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.workspace?.getActive();
    });
    harness.assert(activeWs && activeWs.uri, `Active workspace API returned valid workspace URI (${activeWs?.uri})`);
    harness.assert(activeWs?.state === "open", `Active workspace state is "open"`);

    // Verify Recent Workspaces list API
    const recentWorkspaces = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.workspace?.getRecent();
    });
    harness.assert(Array.isArray(recentWorkspaces), `Get recent workspaces returned array (${recentWorkspaces?.length} items)`);

    return await harness.finish();
  } catch (err) {
    harness.log(`FATAL SUITE ERROR: ${err.message}`);
    return await harness.finish(err.message);
  }
}
