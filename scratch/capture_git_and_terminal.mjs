import { _electron as electron } from "playwright";
import path from "path";
import fs from "fs";

const artifactDir =
  "/Users/srikanthsamudrala/.gemini/antigravity-ide/brain/2dd669df-424f-4427-b761-3df5d3def642";
const screenshotsDir = path.join(artifactDir, "screenshots");

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

console.log("📸 Capturing Proof Screenshots for both Git & Terminal...");

async function captureProofs() {
  const projectRoot = "/Users/srikanthsamudrala/Documents/opencode/open-code.studio";
  const mainPath = path.join(projectRoot, "apps/studio/dist/main/index.js");

  const app = await electron.launch({
    args: [mainPath],
    cwd: projectRoot,
    env: { ...process.env, NODE_ENV: "development" }
  });

  try {
    const window = await app.firstWindow();
    await window.waitForLoadState("domcontentloaded");
    await window.waitForTimeout(2000);

    console.log("📂 Navigating to WorkspaceScreen...");
    await window.evaluate((dir) => {
      window.location.hash = `#workspace/${encodeURIComponent(dir)}`;
    }, projectRoot);

    await window.waitForTimeout(3000);

    // 1. CAPTURE GIT PROOF
    console.log("🔄 Clicking Source Control icon in ActivityBar...");
    const scButton = window.locator('button[title="Source Control"]').first();
    await scButton.click({ force: true });
    await window.waitForTimeout(3500);

    const gitScreenshotPath = path.join(screenshotsDir, "06_source_control.png");
    await window.screenshot({ path: gitScreenshotPath });
    console.log(`✅ Git proof screenshot saved to: ${gitScreenshotPath}`);

    // 2. CAPTURE TERMINAL PROOF
    console.log("💻 Focusing terminal and executing 'pwd'...");
    await window.mouse.click(600, 700);
    await window.keyboard.type("pwd");
    await window.keyboard.press("Enter");
    await window.waitForTimeout(3000);

    const termScreenshotPath = path.join(screenshotsDir, "04_terminal_panel.png");
    await window.screenshot({ path: termScreenshotPath });
    console.log(`✅ Terminal proof screenshot saved to: ${termScreenshotPath}`);
  } catch (err) {
    console.error("❌ Capture failed:", err);
  } finally {
    await app.close();
  }
}

captureProofs();
