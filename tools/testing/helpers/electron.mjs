import { _electron as electron } from "playwright";
import path from "path";
import fs from "fs";

export async function launchElectronApp(
  projectRoot = "/Users/srikanthsamudrala/Documents/opencode/open-code.studio"
) {
  const mainPath = path.join(projectRoot, "apps/studio/dist/main/index.js");

  const app = await electron.launch({
    args: [mainPath],
    cwd: projectRoot,
    env: { ...process.env, NODE_ENV: "development" }
  });

  const window = await app.firstWindow();
  await window.waitForLoadState("domcontentloaded");
  await window.waitForTimeout(3000);

  return {
    app,
    window,
    async close() {
      try {
        await app.close();
      } catch {}
    }
  };
}

export async function captureDiagnosticArtifacts(window, testName, reportsDir) {
  try {
    const screenshotsDir = path.join(reportsDir, "screenshots");
    if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

    const screenshotPath = path.join(screenshotsDir, `${testName}.png`);
    await window.screenshot({ path: screenshotPath });
    return screenshotPath;
  } catch {
    return null;
  }
}
