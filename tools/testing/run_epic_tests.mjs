import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");
const testingDir = __dirname;
const proofDir = path.join(projectRoot, "proof");

if (fs.existsSync(proofDir)) {
  fs.rmSync(proofDir, { recursive: true, force: true });
}
fs.mkdirSync(proofDir, { recursive: true });

console.log("================================================================================");
console.log("     OPEN-CODE.STUDIO ENTERPRISE GOLD-STANDARD E2E SUITE RUNNER                ");
console.log("================================================================================");

async function runAllSuites() {
  const suitesDir = path.join(testingDir, "suites");
  const args = process.argv.slice(2);
  let suiteFiles = fs
    .readdirSync(suitesDir)
    .filter((f) => f.endsWith(".test.mjs"))
    .sort();

  if (args.length > 0) {
    const filter = args[0];
    suiteFiles = suiteFiles.filter((f) => f.includes(filter) || path.basename(f) === path.basename(filter));
  }

  console.log(`📋 Found ${suiteFiles.length} Enterprise E2E Test Suite files in tools/testing/suites/\n`);

  const results = [];
  const startTime = Date.now();

  for (const file of suiteFiles) {
    const suitePath = path.join(suitesDir, file);
    console.log(`▶️ Executing Suite: ${file}...`);
    const sStart = Date.now();

    try {
      const suiteModule = await import(`file://${suitePath}`);
      const res = await suiteModule.run();
      const duration = Date.now() - sStart;

      const fullResult = {
        file,
        duration,
        ...res
      };
      results.push(fullResult);

      if (res.passed) {
        console.log(`   ✅ PASSED [${res.epicId}] ${res.scenarioName} (${res.passedAssertions}/${res.totalAssertions} assertions, ${res.metrics?.mouseClicks || 0} clicks, ${res.metrics?.keyboardEvents || 0} keys, ${duration}ms)`);
      } else {
        console.log(`   ❌ FAILED [${res.epicId}] ${res.scenarioName} (${res.failedAssertions} failed assertions, ${duration}ms)`);
        if (res.logs && res.logs.length > 0) {
          console.log("      --- SUITE LOGS ---");
          for (const line of res.logs) {
            console.log(`      ${line}`);
          }
          console.log("      ------------------");
        }
      }
    } catch (err) {
      const duration = Date.now() - sStart;
      console.log(`   ❌ FATAL SUITE FAILURE [${file}]: ${err.message} (${duration}ms)`);
      results.push({
        file,
        epicId: file.split("_")[1]?.toUpperCase() || "UNKNOWN",
        scenarioName: file,
        passed: false,
        duration,
        totalAssertions: 0,
        passedAssertions: 0,
        failedAssertions: 1,
        metrics: { mouseClicks: 0, keyboardEvents: 0, screenshots: 0 },
        logs: [`Fatal error: ${err.message}`],
        consoleErrors: [err.message]
      });
    }
  }

  const totalDuration = Date.now() - startTime;
  const totalPassed = results.filter((r) => r.passed).length;
  const totalFailed = results.filter((r) => !r.passed).length;

  console.log("");
  console.log("================================================================================");
  console.log("                           EXECUTION SUMMARY RESULTS                            ");
  console.log("================================================================================");
  console.log(` Total Suites Executed : ${results.length}`);
  console.log(` Total Suites Passed   : ${totalPassed}`);
  console.log(` Total Suites Failed   : ${totalFailed}`);
  console.log(` Total Execution Time  : ${(totalDuration / 1000).toFixed(2)}s`);
  console.log("================================================================================\n");

  generateHtmlDashboard(results, totalDuration, proofDir);
  generateJunitXml(results, proofDir);

  if (totalFailed > 0) {
    process.exitCode = 1;
  }
}

function generateHtmlDashboard(results, totalDuration, proofDir) {
  const htmlPath = path.join(proofDir, "dashboard.html");
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const passRate = ((passed / (results.length || 1)) * 100).toFixed(1);

  const rows = results
    .map(
      (r) => `
    <tr style="background-color: ${r.passed ? "rgba(40, 167, 69, 0.1)" : "rgba(220, 53, 69, 0.1)"}">
      <td style="padding: 10px; border-bottom: 1px solid #333;"><strong>${r.epicId}</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #333;">${r.scenarioName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #333; color: ${r.passed ? "#28a745" : "#dc3545"}; font-weight: bold;">${r.passed ? "PASSED" : "FAILED"}</td>
      <td style="padding: 10px; border-bottom: 1px solid #333;">${r.passedAssertions}/${r.totalAssertions}</td>
      <td style="padding: 10px; border-bottom: 1px solid #333;">${r.metrics?.mouseClicks || 0} clicks, ${r.metrics?.keyboardEvents || 0} keys</td>
      <td style="padding: 10px; border-bottom: 1px solid #333;">${r.duration}ms</td>
    </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Open-Code.Studio Enterprise E2E Dashboard</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #1e1e1e; color: #d4d4d4; margin: 20px; }
    h1 { color: #569cd6; }
    .card { background: #252526; padding: 20px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 40px; }
    .metric { font-size: 24px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; background: #252526; border-radius: 8px; overflow: hidden; margin-bottom: 30px; }
    th { background: #333; text-align: left; padding: 12px; color: #9cdcfe; }
  </style>
</head>
<body>
  <h1>🚀 Open-Code.Studio Enterprise Gold-Standard E2E Dashboard</h1>
  <div class="card">
    <div><div>Total Suites</div><div class="metric">${results.length}</div></div>
    <div><div>Pass Rate</div><div class="metric" style="color: #28a745;">${passRate}%</div></div>
    <div><div>Passed</div><div class="metric" style="color: #28a745;">${passed}</div></div>
    <div><div>Failed</div><div class="metric" style="color: #dc3545;">${failed}</div></div>
    <div><div>Execution Time</div><div class="metric">${(totalDuration / 1000).toFixed(2)}s</div></div>
  </div>

  <h2>📊 Suite Execution Matrix</h2>
  <table>
    <thead>
      <tr>
        <th>Epic ID</th>
        <th>Scenario Name</th>
        <th>Status</th>
        <th>Assertions</th>
        <th>Physical Interactions</th>
        <th>Duration</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;

  fs.writeFileSync(htmlPath, html);
  console.log(`📊 Enterprise HTML Dashboard generated at: ${htmlPath}`);
}

function generateJunitXml(results, proofDir) {
  const xmlPath = path.join(proofDir, "junit.xml");
  const testcases = results
    .map(
      (r) => `
    <testcase classname="${r.epicId}" name="${r.scenarioName}" time="${(r.duration / 1000).toFixed(3)}">
      ${!r.passed ? `<failure message="Suite assertions failed (${r.failedAssertions} failed)">${r.consoleErrors?.join("\n") || "Failure"}</failure>` : ""}
    </testcase>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="Open-Code.Studio Enterprise E2E Suite" tests="${results.length}">
${testcases}
</testsuite>`;

  fs.writeFileSync(xmlPath, xml);
  console.log(`📄 JUnit XML Report generated at: ${xmlPath}\n`);
}

runAllSuites();
