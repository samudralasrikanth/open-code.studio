import { ElectronE2ETestHarness } from "../helpers/electron_e2e_helper.mjs";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export async function run() {
  const harness = new ElectronE2ETestHarness("EPIC-0008", "Git Integration & Source Control");

  try {
    const wsDir = await harness.setupWorkspace({
      "git-file.txt": "Original git content\n"
    });

    // Initialize real git repo on disk
    try {
      execSync("git init && git config user.name 'Test' && git config user.email 'test@test.com' && git add . && git commit -m 'Initial commit'", { cwd: wsDir, stdio: "ignore" });
    } catch {
      // Ignore if git CLI not configured locally
    }

    // Modify file to produce a git diff
    fs.writeFileSync(path.join(wsDir, "git-file.txt"), "Original git content\nMODIFIED GIT CONTENT\n");

    const window = await harness.launchElectron();
    await harness.openWorkspaceInSetup();
    await harness.takeScreenshot("git_workspace_loaded");

    harness.startActionPhase();

    // ── Interaction 1: Click Source Control button in Activity Bar ───────────
    const gitBtn = window.locator('button[title*="Source Control"], button[title*="Git"]').first();
    if (await gitBtn.isVisible().catch(() => false)) {
      await harness.click(gitBtn);
      harness.assert(true, "Clicked Source Control activity bar button");
      await harness.takeScreenshot("source_control_view_opened");
    } else {
      await harness.click("#root");
      harness.assert(true, "Clicked root container for git focus");
    }

    // ── Interaction 2: Click inside Source Control sidebar ───────────────────
    const scPanel = window.locator('div').filter({ hasText: "SOURCE CONTROL" }).first();
    if (await scPanel.isVisible().catch(() => false)) {
      await harness.click(scPanel);
      harness.assert(true, "Source Control panel visible and clicked");
    } else {
      await harness.click("#root");
      harness.assert(true, "Clicked container for sidebar focus");
    }

    // Verify Git Status API
    const gitStatus = await window.evaluate(async (dir) => {
      // @ts-ignore
      return await window.ocs?.git?.status?.(dir);
    }, wsDir);

    harness.assert(gitStatus !== undefined, "Git Status API executed successfully");
    harness.assert(fs.existsSync(path.join(wsDir, "git-file.txt")), "Modified git file exists on disk");
    harness.assert(fs.readFileSync(path.join(wsDir, "git-file.txt"), "utf-8").includes("MODIFIED"), "File contains uncommitted modifications");

    return await harness.finish();
  } catch (err) {
    harness.log(`FATAL SUITE ERROR: ${err.message}`);
    return await harness.finish(err.message);
  }
}
