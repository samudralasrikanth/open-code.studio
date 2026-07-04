import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { launchElectronApp, captureDiagnosticArtifacts } from "./helpers/electron.mjs";
import { createTempWorkspace } from "./builders/workspaceBuilder.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");
const testingDir = __dirname;
const reportsDir = path.join(testingDir, "reports");

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

console.log("================================================================================");
console.log("          OPEN-CODE.STUDIO EPIC VALIDATION PLATFORM RUNNER                      ");
console.log("================================================================================");

async function runPlatformSuites() {
  const manifestPath = path.join(testingDir, "manifest/epic-manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  const suitesDir = path.join(testingDir, "suites");
  const suiteFiles = fs
    .readdirSync(suitesDir)
    .filter((f) => f.endsWith(".test.mjs"))
    .sort();

  console.log(
    `📋 Found ${suiteFiles.length} Epic Validation Suite files in tools/testing/suites/\n`
  );

  const results = [];
  const startTime = Date.now();

  // Create workspace fixture
  const tempWorkspace = createTempWorkspace("runner-fixture");

  // Launch Electron App instance
  console.log("🚀 Launching Electron Application Runtime...");
  let appInstance = null;

  try {
    appInstance = await launchElectronApp(projectRoot);
    console.log("✅ Electron Application launched successfully.\n");
  } catch (err) {
    console.error("❌ Failed to launch Electron Application:", err);
  }

  for (const file of suiteFiles) {
    const suitePath = path.join(suitesDir, file);
    const suiteModule = await import(`file://${suitePath}`);
    const { epicMetadata, scenarios } = suiteModule;

    console.log(
      `▶️ Executing ${epicMetadata.epic}: ${epicMetadata.name} (${scenarios.length} Scenarios)...`
    );

    const epicStartTime = Date.now();
    let epicPassed = 0;
    let epicFailed = 0;

    for (const scenario of scenarios) {
      const sStart = Date.now();
      try {
        if (!appInstance) {
          throw new Error("Electron app instance unavailable");
        }

        await scenario.run({
          window: appInstance.window,
          projectRoot,
          tempWorkspace,
          testingDir
        });

        const duration = Date.now() - sStart;
        epicPassed++;
        results.push({
          epic: epicMetadata.epic,
          epicName: epicMetadata.name,
          scenarioId: scenario.id,
          title: scenario.title,
          status: "PASSED",
          duration,
          error: null
        });
        console.log(`   ✅ [${scenario.id}] ${scenario.title} (${duration}ms)`);
      } catch (err) {
        const duration = Date.now() - sStart;
        epicFailed++;
        const artifactPath = appInstance
          ? await captureDiagnosticArtifacts(appInstance.window, scenario.id, reportsDir)
          : null;

        results.push({
          epic: epicMetadata.epic,
          epicName: epicMetadata.name,
          scenarioId: scenario.id,
          title: scenario.title,
          status: "FAILED",
          duration,
          error: err.message,
          artifactPath
        });
        console.log(
          `   ❌ [${scenario.id}] ${scenario.title} (${duration}ms) - Error: ${err.message}`
        );
      }
    }

    const epicDuration = Date.now() - epicStartTime;
    console.log(`   Summary: ${epicPassed} Passed, ${epicFailed} Failed (${epicDuration}ms)\n`);
  }

  // Teardown
  if (appInstance) {
    await appInstance.close();
    console.log("🛑 Electron Application closed.");
  }
  tempWorkspace.cleanup();

  const totalDuration = Date.now() - startTime;
  const totalPassed = results.filter((r) => r.status === "PASSED").length;
  const totalFailed = results.filter((r) => r.status === "FAILED").length;

  console.log("================================================================================");
  console.log("                           EXECUTION SUMMARY RESULTS                            ");
  console.log("================================================================================");
  console.log(` Total Scenarios Executed : ${results.length}`);
  console.log(` Total Scenarios Passed   : ${totalPassed}`);
  console.log(` Total Scenarios Failed   : ${totalFailed}`);
  console.log(` Total Execution Time     : ${(totalDuration / 1000).toFixed(2)}s`);
  console.log("================================================================================\n");

  // Generate HTML Dashboard Report
  generateHtmlDashboard(results, totalDuration, reportsDir);
  generateJunitXml(results, reportsDir);

  if (totalFailed > 0) {
    process.exitCode = 1;
  }
}

function generateHtmlDashboard(results, totalDuration, reportsDir) {
  const htmlPath = path.join(reportsDir, "dashboard.html");
  const passed = results.filter((r) => r.status === "PASSED").length;
  const failed = results.filter((r) => r.status === "FAILED").length;
  const passRate = ((passed / (results.length || 1)) * 100).toFixed(1);

  const rows = results
    .map(
      (r) => `
    <tr style="background-color: ${r.status === "PASSED" ? "rgba(40, 167, 69, 0.1)" : "rgba(220, 53, 69, 0.1)"}">
      <td style="padding: 10px; border-bottom: 1px solid #333;"><strong>${r.epic}</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #333;">${r.scenarioId}</td>
      <td style="padding: 10px; border-bottom: 1px solid #333;">${r.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #333; color: ${r.status === "PASSED" ? "#28a745" : "#dc3545"}; font-weight: bold;">${r.status}</td>
      <td style="padding: 10px; border-bottom: 1px solid #333;">${r.duration}ms</td>
      <td style="padding: 10px; border-bottom: 1px solid #333;">${r.error || "-"}</td>
    </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Open-Code.Studio Test Validation Dashboard</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #1e1e1e; color: #d4d4d4; margin: 20px; }
    h1 { color: #569cd6; }
    .card { background: #252526; padding: 20px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 40px; }
    .metric { font-size: 24px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; background: #252526; border-radius: 8px; overflow: hidden; }
    th { background: #333; text-align: left; padding: 12px; color: #9cdcfe; }
  </style>
</head>
<body>
  <h1>🚀 Open-Code.Studio Epic Validation Dashboard</h1>
  <div class="card">
    <div><div>Total Scenarios</div><div class="metric">${results.length}</div></div>
    <div><div>Pass Rate</div><div class="metric" style="color: #28a745;">${passRate}%</div></div>
    <div><div>Passed</div><div class="metric" style="color: #28a745;">${passed}</div></div>
    <div><div>Failed</div><div class="metric" style="color: #dc3545;">${failed}</div></div>
    <div><div>Execution Time</div><div class="metric">${(totalDuration / 1000).toFixed(2)}s</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Epic</th>
        <th>Scenario ID</th>
        <th>Title</th>
        <th>Status</th>
        <th>Duration</th>
        <th>Error Details</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;

  fs.writeFileSync(htmlPath, html);
  console.log(`📊 HTML Dashboard Report generated at: ${htmlPath}`);
}

function generateJunitXml(results, reportsDir) {
  const xmlPath = path.join(reportsDir, "junit.xml");
  const testcases = results
    .map(
      (r) => `
    <testcase classname="${r.epic}" name="${r.scenarioId}: ${r.title}" time="${(r.duration / 1000).toFixed(3)}">
      ${r.status === "FAILED" ? `<failure message="${r.error}">${r.error}</failure>` : ""}
    </testcase>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="Open-Code.Studio Epic Validation Suite" tests="${results.length}">
${testcases}
</testsuite>`;

  fs.writeFileSync(xmlPath, xml);
  console.log(`📄 JUnit XML Report generated at: ${xmlPath}\n`);
}

runPlatformSuites();
