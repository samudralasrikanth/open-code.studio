import { _electron as electron } from "playwright";
import path from "path";

console.log("🚀 Running targeted Terminal & Git physical validation test...");

async function runTargetedTests() {
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
    await window.waitForTimeout(3000);

    console.log("\n--- 1. TESTING GIT INTEGRATION ---");
    const gitStatus = await window.evaluate(async () => {
      try {
        return await window.ocs.git.status();
      } catch (e) {
        return { error: e.message };
      }
    });

    console.log("Git Status Result:", JSON.stringify(gitStatus, null, 2));

    console.log("\n--- 2. TESTING TERMINAL SPANNING & INPUT/OUTPUT ---");
    const terminalResult = await window.evaluate(async () => {
      return new Promise(async (resolve) => {
        try {
          let outputBuffer = "";
          const unsub = window.ocs.terminal.onOutput((payload) => {
            outputBuffer += payload.data;
          });

          const session = await window.ocs.terminal.create({
            cwd: "/Users/srikanthsamudrala/Documents/opencode/open-code.studio",
            cols: 80,
            rows: 24
          });

          await window.ocs.terminal.sendText(session.id, "echo 'TEST_TERMINAL_SUCCESS'\n");

          setTimeout(async () => {
            unsub();
            await window.ocs.terminal.close(session.id);
            resolve({ sessionId: session.id, output: outputBuffer });
          }, 3000);
        } catch (e) {
          resolve({ error: e.message });
        }
      });
    });

    console.log("Terminal Result:", JSON.stringify(terminalResult, null, 2));
  } catch (err) {
    console.error("❌ Test failed:", err);
  } finally {
    await app.close();
  }
}

runTargetedTests();
