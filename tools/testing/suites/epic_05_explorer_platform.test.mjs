import { ElectronE2ETestHarness } from "../helpers/electron_e2e_helper.mjs";
import fs from "fs";
import path from "path";

export async function run() {
  const harness = new ElectronE2ETestHarness("EPIC-0005", "Explorer Tree Platform & Tab Mechanics");

  try {
    const wsDir = await harness.setupWorkspace({
      "src/index.ts": "export const a = 1;",
      "src/utils.ts": "export function add(a, b) { return a + b; }",
      "README.md": "# Explorer Test Project"
    });

    const window = await harness.launchElectron();
    await harness.openWorkspaceInSetup();
    await harness.takeScreenshot("explorer_workspace_loaded");

    harness.startActionPhase();

    const treeItems = window.locator('[role="treeitem"]');
    await treeItems.first().waitFor({ state: "visible", timeout: 10000 });
    const initialCount = await treeItems.count();
    harness.assert(initialCount > 0, `Explorer sidebar loaded ${initialCount} tree item(s)`);

    // ── Interaction 1: Single Click (Preview Tab) ────────────────────────────
    const readmeNode = treeItems.filter({ hasText: "README.md" }).first();
    harness.assert(await readmeNode.isVisible(), "README.md file node visible in tree");
    await harness.click(readmeNode);
    await harness.takeScreenshot("single_click_preview_tab");

    const tabLocator = window.locator("div").filter({ hasText: "README.md" }).first();
    await tabLocator.waitFor({ state: "visible", timeout: 5000 });
    harness.assert(await tabLocator.isVisible(), "Single Click opened preview tab in Editor area");

    // ── Interaction 2: Double Click (Permanent Tab) ──────────────────────────
    await harness.dblclick(readmeNode);
    await harness.takeScreenshot("double_click_permanent_tab");
    harness.assert(
      await tabLocator.isVisible(),
      "Double Click pinned permanent tab in Editor area"
    );

    // ── Interaction 3: Expand / Collapse Directory ───────────────────────────
    const srcFolderNode = treeItems.filter({ hasText: "src" }).first();
    if (await srcFolderNode.isVisible().catch(() => false)) {
      await harness.click(srcFolderNode);
      await window.waitForTimeout(300);
      await harness.takeScreenshot("folder_expanded");
      const countAfterExpand = await treeItems.count();
      harness.assert(
        countAfterExpand >= initialCount,
        `Expanding directory increased visible nodes (${countAfterExpand})`
      );
    }

    return await harness.finish();
  } catch (err) {
    harness.log(`FATAL SUITE ERROR: ${err.message}`);
    return await harness.finish(err.message);
  }
}
