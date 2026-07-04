import path from "path";
import fs from "fs";
import { ElectronE2ETestHarness, projectRoot, studioRoot } from "../helpers/electron_e2e_helper.mjs";

export async function run() {
  const harness = new ElectronE2ETestHarness("EPIC-0001", "Repository Foundation & Runtime Boot");

  try {
    // ── PART 1: Build & Lockfile Integrity Validation ──────────────────────────
    harness.log("PART 1: Build & Lockfile Integrity Validation");
    
    const lockfilePath = path.join(projectRoot, "pnpm-lock.yaml");
    harness.assert(fs.existsSync(lockfilePath), "Lockfile (pnpm-lock.yaml) exists in workspace root");

    const mainDist = path.join(studioRoot, "dist/main/index.js");
    harness.assert(fs.existsSync(mainDist), "Main process production bundle exists (dist/main/index.js)");

    const preloadDist = path.join(studioRoot, "dist/preload/index.js");
    harness.assert(fs.existsSync(preloadDist), "Preload production bundle exists (dist/preload/index.js)");

    const rendererDist = path.join(studioRoot, "dist/renderer/index.html");
    harness.assert(fs.existsSync(rendererDist), "Renderer production bundle exists (dist/renderer/index.html)");

    // ── PART 2: Electron Runtime Shell Boot ──────────────────────────────────
    harness.log("PART 2: Electron Runtime Shell Boot");
    await harness.setupWorkspace({ "readme.txt": "Foundation Test" });
    const window = await harness.launchElectron();

    await harness.takeScreenshot("initial_shell_boot");

    harness.startActionPhase();

    // Interaction 1: Click title bar to focus window
    await harness.click("#root > div");

    // Interaction 2: Send keyboard shortcut Ctrl+B / Cmd+B to test key bindings
    await harness.pressShortcut("Meta+b");
    await window.waitForTimeout(300);
    await harness.takeScreenshot("after_sidebar_toggle");

    await harness.pressShortcut("Meta+b");
    await window.waitForTimeout(300);

    const title = await window.title();
    harness.assert(title === "Open-Code.Studio", `Window title is "${title}"`);

    const bounds = await window.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight
    }));
    harness.assert(bounds.width >= 800 && bounds.height >= 600, `Window bounds valid (${bounds.width}x${bounds.height})`);

    return await harness.finish();
  } catch (err) {
    harness.log(`FATAL SUITE ERROR: ${err.message}`);
    return await harness.finish(err.message);
  }
}
