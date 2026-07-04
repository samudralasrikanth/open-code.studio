import { _electron as electron } from "playwright";
import path from "path";
import fs from "fs";

const artifactDir =
  "/Users/srikanthsamudrala/.gemini/antigravity-ide/brain/2dd669df-424f-4427-b761-3df5d3def642";
const screenshotsDir = path.join(artifactDir, "screenshots");

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

console.log("📸 Capturing Terminal Interactive Screenshot...");

async function captureTerminalProof() {
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

    console.log("📂 Setting window hash to navigate directly to WorkspaceScreen...");
    await window.evaluate((dir) => {
      window.location.hash = `#workspace/${encodeURIComponent(dir)}`;
    }, projectRoot);

    await window.waitForTimeout(4000);

    console.log("🖱️ Clicking Terminal tab in bottom panel...");
    await window.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("div"));
      const terminalTab = tabs.find(
        (el) => el.textContent === "Terminal" && el.getAttribute("style")?.includes("cursor")
      );
      if (terminalTab) terminalTab.click();
    });

    await window.waitForTimeout(1000);

    console.log("⌨️ Typing terminal command into terminal...");
    await window.mouse.click(600, 700);
    await window.keyboard.type("echo PHYSICAL_TERMINAL_PROOF_OK");
    await window.keyboard.press("Enter");
    await window.waitForTimeout(2000);

    const screenshotPath = path.join(screenshotsDir, "04_terminal_panel.png");
    await window.screenshot({ path: screenshotPath });
    console.log(`✅ Terminal proof screenshot saved to: ${screenshotPath}`);
  } catch (err) {
    console.error("❌ Terminal capture failed:", err);
  } finally {
    await app.close();
  }
}

captureTerminalProof();
