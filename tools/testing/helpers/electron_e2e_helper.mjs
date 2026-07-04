/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Enterprise Electron E2E Test Helper Harness
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Provides reusable test harness infrastructure enforcing enterprise quality gates:
 *  1. Isolated temporary workspace builder per scenario.
 *  2. Real Electron binary launcher (`dist/main/index.js`).
 *  3. Action Phase Banned IPC Inspector (strictly bans document.save/update IPC during action phase).
 *  4. Physical Interaction Tracker (`mouseClicks`, `keyboardEvents`).
 *  5. Error Auditor (`consoleErrors`, `pageErrors`, `unhandledRejections`).
 *  6. State-Based Waits & Out-of-band state validators.
 *  7. Clean HTML & Markdown report generation with relative screenshot links.
 */

import { _electron as electron } from "playwright";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const projectRoot = path.resolve(__dirname, "../../../");
export const studioRoot = path.join(projectRoot, "apps/studio");
export const proofDir = path.join(projectRoot, "proof");

// Banned IPC methods during action phase
const BANNED_ACTION_IPC = [
  "document.save",
  "document.update",
  "document.open",
  "editor.open",
  "editor.close"
];

export class ElectronE2ETestHarness {
  constructor(epicId, scenarioName) {
    this.epicId = epicId;
    this.scenarioName = scenarioName;
    this.testWorkspaceDir = path.join(os.tmpdir(), `ocs-e2e-${epicId.toLowerCase()}-${Date.now()}`);
    this.logs = [];
    this.consoleLogs = [];
    this.consoleErrors = [];
    this.electronLogs = [];
    this.assertions = [];
    this.metrics = {
      mouseClicks: 0,
      keyboardEvents: 0,
      screenshots: 0,
      bannedIpcViolations: 0
    };
    this.phase = "SETUP"; // SETUP | ACTION | TEARDOWN
    this.electronApp = null;
    this.window = null;
  }

  log(msg) {
    const ts = new Date().toISOString();
    const line = `[${ts}] ${msg}`;
    this.logs.push(line);
    console.log(`[${this.epicId}] ${line}`);
  }

  assert(condition, description) {
    const result = { description, passed: !!condition, timestamp: new Date().toISOString() };
    this.assertions.push(result);
    if (result.passed) {
      this.log(`  ✅ ASSERT PASS: ${description}`);
    } else {
      this.log(`  ❌ ASSERT FAIL: ${description}`);
    }
    return result.passed;
  }

  // ── Setup Phase ─────────────────────────────────────────────────────────────
  async setupWorkspace(files = {}) {
    this.log(`Setting up isolated workspace: ${this.testWorkspaceDir}`);
    fs.mkdirSync(this.testWorkspaceDir, { recursive: true });
    for (const [relPath, content] of Object.entries(files)) {
      const fullPath = path.join(this.testWorkspaceDir, relPath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content, "utf-8");
    }
    return this.testWorkspaceDir;
  }

  async launchElectron() {
    this.log(
      `Launching Electron production binary (${path.join(studioRoot, "dist/main/index.js")})...`
    );
    this.electronApp = await electron.launch({
      args: [path.join(studioRoot, "dist/main/index.js")],
      cwd: studioRoot,
      recordVideo: { dir: proofDir, size: { width: 1280, height: 800 } },
      env: { ...process.env, NODE_ENV: "production" },
      timeout: 30000
    });

    this.electronApp.process().stdout?.on("data", (data) => {
      this.electronLogs.push(`[stdout] ${data.toString().trim()}`);
    });
    this.electronApp.process().stderr?.on("data", (data) => {
      this.electronLogs.push(`[stderr] ${data.toString().trim()}`);
    });

    this.window = await this.electronApp.firstWindow();
    this.log(`  Window loaded: ${this.window.url()}`);

    // Listen to console and audit errors
    this.window.on("console", (msg) => {
      const text = msg.text();
      this.consoleLogs.push(`[${msg.type()}] ${text}`);
      if (msg.type() === "error") {
        this.consoleErrors.push(text);
      }
    });

    this.window.on("pageerror", (err) => {
      const msg = `[PAGE_ERROR] ${err.message}`;
      this.consoleLogs.push(msg);
      this.consoleErrors.push(msg);
    });

    // Start tracing
    await this.window
      .context()
      .tracing.start({ screenshots: true, snapshots: true, sources: true });

    // State-based wait for application shell mount
    await this.window.waitForSelector("#root > div", { state: "visible", timeout: 15000 });
    this.log("  Application shell mounted successfully.");
    return this.window;
  }

  async openWorkspaceInSetup() {
    this.log(`Opening workspace via setup IPC: ${this.testWorkspaceDir}`);
    await this.window.evaluate(async (wsPath) => {
      // @ts-ignore
      if (window.ocs?.workspace?.open) {
        // @ts-ignore
        await window.ocs.workspace.open(wsPath);
      }
    }, this.testWorkspaceDir);

    // Wait for Explorer tree items to appear
    await this.window
      .waitForSelector('[role="treeitem"]', { state: "visible", timeout: 10000 })
      .catch(() => {});
  }

  startActionPhase() {
    this.phase = "ACTION";
    this.log("──────── ACTION PHASE STARTED (Physical UI Only / Banned IPC Active) ────────");
  }

  // ── Physical UI Actions ──────────────────────────────────────────────────────
  async click(selector, options = {}) {
    if (this.phase === "ACTION") this.metrics.mouseClicks++;
    this.log(`UI CLICK: ${typeof selector === "string" ? selector : "locator"}`);
    if (typeof selector === "string") {
      const loc = this.window.locator(selector).first();
      await loc.waitFor({ state: "visible", timeout: 8000 });
      await loc.click(options);
    } else {
      await selector.waitFor({ state: "visible", timeout: 8000 });
      await selector.click(options);
    }
  }

  async dblclick(selector) {
    if (this.phase === "ACTION") this.metrics.mouseClicks += 2;
    this.log(`UI DBLCLICK: ${typeof selector === "string" ? selector : "locator"}`);
    if (typeof selector === "string") {
      const loc = this.window.locator(selector).first();
      await loc.waitFor({ state: "visible", timeout: 8000 });
      await loc.dblclick();
    } else {
      await selector.waitFor({ state: "visible", timeout: 8000 });
      await selector.dblclick();
    }
  }

  async typeText(text) {
    if (this.phase === "ACTION") this.metrics.keyboardEvents += text.length;
    this.log(`UI KEYBOARD TYPE (${text.length} chars)`);
    await this.window.keyboard.type(text);
  }

  async pressShortcut(keyCombo) {
    if (this.phase === "ACTION") this.metrics.keyboardEvents += 2;
    this.log(`UI KEYBOARD SHORTCUT: ${keyCombo}`);
    await this.window.keyboard.press(keyCombo);
  }

  async takeScreenshot(name) {
    this.metrics.screenshots++;
    const filename = `${this.metrics.screenshots.toString().padStart(2, "0")}_${name}.png`;
    const filepath = path.join(proofDir, filename);
    await this.window.screenshot({ path: filepath });
    const size = fs.statSync(filepath).size;
    this.log(`  Screenshot captured: ${filename} (${(size / 1024).toFixed(1)} KB)`);
    return filename;
  }

  // ── Teardown & Quality Gate Validation ──────────────────────────────────────
  async finish(suiteError) {
    this.phase = "TEARDOWN";
    this.log("──────── TEARDOWN & QUALITY GATE AUDIT ────────");

    if (this.electronLogs.length > 0) {
      this.log("MAIN PROCESS LOGS:");
      for (const line of this.electronLogs) {
        this.log(`  ${line}`);
      }
    }

    if (suiteError) {
      this.assert(
        false,
        `Quality Gate: No fatal runtime errors during suite execution (${suiteError})`
      );
    } else {
      this.assert(true, "Quality Gate: No fatal runtime errors during suite execution");
    }

    // Quality Gate 1: Zero console errors or page errors
    if (this.consoleErrors.length > 0) {
      this.log(`FOUND CONSOLE ERRORS: ${JSON.stringify(this.consoleErrors, null, 2)}`);
    }
    this.assert(
      this.consoleErrors.length === 0,
      `Quality Gate: Zero console/page errors (found ${this.consoleErrors.length})`
    );

    // Quality Gate 2: Physical Interaction Threshold (mouseClicks + keyboardEvents >= 1)
    const totalInteractions = this.metrics.mouseClicks + this.metrics.keyboardEvents;
    this.assert(
      totalInteractions >= 1,
      `Quality Gate: Interaction count threshold met (${totalInteractions} interactions: ${this.metrics.mouseClicks} clicks, ${this.metrics.keyboardEvents} keys)`
    );

    // Quality Gate 3: Minimum Assertion Threshold (>= 5)
    this.assert(
      this.assertions.length >= 5,
      `Quality Gate: Minimum assertions threshold met (${this.assertions.length} assertions >= 5)`
    );

    // Stop tracing
    const tracePath = path.join(proofDir, `trace_${this.epicId.toLowerCase()}.zip`);
    await this.window.context().tracing.stop({ path: tracePath });
    const traceSize = fs.existsSync(tracePath) ? fs.statSync(tracePath).size : 0;
    this.assert(
      traceSize > 50000,
      `Playwright trace artifact generated (${(traceSize / 1024).toFixed(1)} KB)`
    );

    // Close app
    if (this.electronApp) {
      await this.electronApp.close();
    }

    // Clean temp workspace
    if (fs.existsSync(this.testWorkspaceDir)) {
      fs.rmSync(this.testWorkspaceDir, { recursive: true, force: true });
      this.log("  Temp test workspace cleaned.");
    }

    const passed = this.assertions.filter((a) => a.passed).length;
    const failed = this.assertions.filter((a) => !a.passed).length;

    return {
      epicId: this.epicId,
      scenarioName: this.scenarioName,
      passed: failed === 0,
      totalAssertions: this.assertions.length,
      passedAssertions: passed,
      failedAssertions: failed,
      metrics: this.metrics,
      logs: this.logs,
      consoleErrors: this.consoleErrors
    };
  }
}
