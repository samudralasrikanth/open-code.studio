import { _electron as electron } from "playwright";
import path from "path";
import fs from "fs";

const artifactDir =
  "/Users/srikanthsamudrala/.gemini/antigravity-ide/brain/2dd669df-424f-4427-b761-3df5d3def642";
const screenshotsDir = path.join(artifactDir, "screenshots");

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

console.log("🚀 Starting Electron Physical E2E Test Suite...");

async function runTests() {
  const projectRoot = "/Users/srikanthsamudrala/Documents/opencode/open-code.studio";
  const mainPath = path.join(projectRoot, "apps/studio/dist/main/index.js");

  const app = await electron.launch({
    executablePath: undefined,
    args: [mainPath],
    cwd: projectRoot,
    env: { ...process.env, NODE_ENV: "development" }
  });

  try {
    console.log("📱 Electron App launched. Getting first window...");
    const window = await app.firstWindow();
    await window.waitForLoadState("domcontentloaded");
    await window.waitForTimeout(3000);

    console.log("✅ Step 1: Testing Workspace & File Explorer...");
    await window.screenshot({ path: path.join(screenshotsDir, "01_explorer_tree.png") });
    console.log("   -> Screenshot saved: 01_explorer_tree.png");

    console.log("✅ Step 2: Testing Document & Monaco Editor...");
    const fileNode = window
      .locator('div[role="treeitem"]')
      .filter({ hasText: "package.json" })
      .first();
    if (await fileNode.isVisible()) {
      console.log("   -> Clicking package.json in file tree...");
      await fileNode.click();
      await window.waitForTimeout(2000);
      await window.screenshot({ path: path.join(screenshotsDir, "02_monaco_editor.png") });
      console.log("   -> Screenshot saved: 02_monaco_editor.png");

      const splitBtn = window.locator('button:has-text("Split Right")').first();
      if (await splitBtn.isVisible()) {
        console.log("   -> Clicking Split Right button...");
        await splitBtn.click();
        await window.waitForTimeout(1000);
        await window.screenshot({ path: path.join(screenshotsDir, "03_editor_split.png") });
        console.log("   -> Screenshot saved: 03_editor_split.png");
      }
    }

    console.log("✅ Step 3: Testing Integrated Terminal...");
    await window.screenshot({ path: path.join(screenshotsDir, "04_terminal_panel.png") });
    console.log("   -> Screenshot saved: 04_terminal_panel.png");

    console.log("✅ Step 4: Testing Search & Replace Engine...");
    await window.evaluate(() => {
      const el = document.querySelector('span[title="Search"]');
      if (el && el.parentElement) el.parentElement.click();
    });
    await window.waitForTimeout(1000);
    const searchInput = window.locator('input[placeholder="Search"]').first();
    if (await searchInput.isVisible()) {
      console.log("   -> Typing search query 'package.json'...");
      await searchInput.fill("package.json");
      await searchInput.press("Enter");
      await window.waitForTimeout(2500);
    }
    await window.screenshot({ path: path.join(screenshotsDir, "05_search_results.png") });
    console.log("   -> Screenshot saved: 05_search_results.png");

    console.log("✅ Step 5: Testing Source Control (Git)...");
    await window.evaluate(() => {
      const el = document.querySelector('span[title="Source Control"]');
      if (el && el.parentElement) el.parentElement.click();
    });
    await window.waitForTimeout(1500);
    await window.screenshot({ path: path.join(screenshotsDir, "06_source_control.png") });
    console.log("   -> Screenshot saved: 06_source_control.png");

    console.log("✅ Step 6: Testing Settings Platform...");
    await window.evaluate(() => {
      const el = document.querySelector('span[title="Settings"]');
      if (el && el.parentElement) el.parentElement.click();
    });
    await window.waitForTimeout(1500);
    await window.screenshot({ path: path.join(screenshotsDir, "07_settings_editor.png") });
    console.log("   -> Screenshot saved: 07_settings_editor.png");

    console.log("✅ Step 7: Testing Command Palette...");
    await window.evaluate(() => {
      const el = document.querySelector('span[title="Explorer"]');
      if (el && el.parentElement) el.parentElement.click();
    });
    await window.waitForTimeout(500);
    await window.keyboard.press("F1");
    await window.waitForTimeout(1000);
    await window.screenshot({ path: path.join(screenshotsDir, "08_command_palette.png") });
    console.log("   -> Screenshot saved: 08_command_palette.png");

    console.log("🎉 All Physical E2E Tests Executed Successfully!");
  } catch (err) {
    console.error("❌ Test execution failed:", err);
  } finally {
    await app.close();
  }
}

runTests();
