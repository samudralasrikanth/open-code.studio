import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");
const proofDir = path.join(projectRoot, "proof");

// Clean previous proof
if (fs.existsSync(proofDir)) {
  fs.rmSync(proofDir, { recursive: true, force: true });
}
fs.mkdirSync(proofDir, { recursive: true });

const consoleLogs = [];
const playwrightLog = [];

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  playwrightLog.push(line);
  console.log(line);
}

async function runProof() {
  log("=== EPIC-0006 Document Editor Proof Package ===");
  log("Launching Chromium browser pointed at http://localhost:5173...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: { dir: proofDir, size: { width: 1280, height: 800 } },
    viewport: { width: 1280, height: 800 }
  });

  // Start tracing
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  log("Playwright tracing started (screenshots + snapshots + sources).");

  const page = await context.newPage();
  page.on("console", (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    consoleLogs.push(`[PAGE_ERROR] ${err.message}`);
  });

  // Navigate to the live renderer
  log("Navigating to http://localhost:5173...");
  await page.goto("http://localhost:5173", { waitUntil: "networkidle", timeout: 15000 });
  log("Page loaded. Waiting 3s for React to render...");
  await page.waitForTimeout(3000);

  // ──────────── STEP 1: BEFORE Screenshot ────────────
  log("STEP 1: Capturing BEFORE screenshot (initial state).");
  await page.screenshot({ path: path.join(proofDir, "before.png"), fullPage: true });
  const beforeSize = fs.statSync(path.join(proofDir, "before.png")).size;
  log(`  before.png captured: ${beforeSize} bytes`);

  // Capture what's actually visible
  const beforeState = await page.evaluate(() => {
    return {
      title: document.title,
      bodyText: document.body.innerText.substring(0, 500),
      hasActivityBar: !!document.querySelector('[class*="activity"]') || !!document.querySelector('[class*="ActivityBar"]'),
      hasSidebar: !!document.querySelector('[class*="sidebar"]') || !!document.querySelector('[class*="Sidebar"]'),
      hasEditor: !!document.querySelector('[class*="editor"]') || !!document.querySelector('[class*="Editor"]') || !!document.querySelector('.monaco-editor'),
      hasTerminal: !!document.querySelector('[class*="terminal"]') || !!document.querySelector('[class*="Terminal"]'),
      allButtons: Array.from(document.querySelectorAll('button')).map(b => b.title || b.textContent || '').filter(Boolean).slice(0, 20),
      allDataTestIds: Array.from(document.querySelectorAll('[data-testid]')).map(el => el.getAttribute('data-testid')).slice(0, 20),
      allClassNames: Array.from(new Set(
        Array.from(document.querySelectorAll('*'))
          .flatMap(el => Array.from(el.classList))
          .filter(c => c.length > 3)
      )).slice(0, 40)
    };
  });
  log(`  Page title: "${beforeState.title}"`);
  log(`  Body text (first 200 chars): "${beforeState.bodyText.substring(0, 200)}"`);
  log(`  Has ActivityBar: ${beforeState.hasActivityBar}`);
  log(`  Has Sidebar: ${beforeState.hasSidebar}`);
  log(`  Has Editor: ${beforeState.hasEditor}`);
  log(`  Has Terminal: ${beforeState.hasTerminal}`);
  log(`  Buttons found: ${JSON.stringify(beforeState.allButtons)}`);
  log(`  data-testid elements: ${JSON.stringify(beforeState.allDataTestIds)}`);
  log(`  CSS classes (sample): ${JSON.stringify(beforeState.allClassNames.slice(0, 15))}`);

  // ──────────── STEP 2: Interact with the Application ────────────
  log("STEP 2: Attempting to interact with the application UI...");

  // Try clicking the Explorer button in the activity bar
  const explorerBtn = page.locator('button[title="Explorer"]').first();
  if (await explorerBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    log("  Found Explorer button - clicking it.");
    await explorerBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(proofDir, "step2_explorer_clicked.png") });
    log("  step2_explorer_clicked.png captured.");
  } else {
    log("  Explorer button not found by title. Trying other selectors...");
    // Try any clickable icon in sidebar
    const buttons = await page.locator('button').all();
    log(`  Found ${buttons.length} buttons total on page.`);
    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
      const text = await buttons[i].textContent().catch(() => '');
      const title = await buttons[i].getAttribute('title').catch(() => '');
      log(`    Button ${i}: text="${text?.trim()}" title="${title}"`);
    }
  }

  // ──────────── STEP 3: Try typing into any editor/textarea ────────────
  log("STEP 3: Attempting to type into editor...");

  const monacoEditor = page.locator('.monaco-editor .view-lines').first();
  const textarea = page.locator('textarea').first();
  const inputField = page.locator('input[type="text"]').first();

  if (await monacoEditor.isVisible({ timeout: 2000 }).catch(() => false)) {
    log("  Monaco editor found! Clicking and typing...");
    await monacoEditor.click();
    await page.keyboard.type("// EPIC-0006 Proof: Real text typed at " + new Date().toISOString());
    await page.waitForTimeout(500);
    log("  Text typed into Monaco editor.");
  } else if (await textarea.isVisible({ timeout: 1000 }).catch(() => false)) {
    log("  Textarea found. Clicking and typing...");
    await textarea.click();
    await textarea.fill("// EPIC-0006 Proof: Real text typed at " + new Date().toISOString());
    log("  Text typed into textarea.");
  } else if (await inputField.isVisible({ timeout: 1000 }).catch(() => false)) {
    log("  Input field found. Typing...");
    await inputField.fill("EPIC-0006 Proof");
    log("  Text typed into input field.");
  } else {
    log("  WARNING: No editor, textarea, or input field found. The application may not have a file open.");
    // Just click somewhere on the page to show we can interact
    await page.mouse.click(640, 400);
    log("  Clicked center of page.");
  }

  await page.screenshot({ path: path.join(proofDir, "step3_after_typing.png") });
  log("  step3_after_typing.png captured.");

  // ──────────── STEP 4: Save (Cmd+S) ────────────
  log("STEP 4: Pressing Cmd+S (Meta+s) to save...");
  await page.keyboard.press("Meta+s");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(proofDir, "step4_after_save.png") });
  log("  step4_after_save.png captured.");

  // ──────────── STEP 5: AFTER Screenshot ────────────
  log("STEP 5: Capturing AFTER screenshot (final state).");
  await page.screenshot({ path: path.join(proofDir, "after.png"), fullPage: true });
  const afterSize = fs.statSync(path.join(proofDir, "after.png")).size;
  log(`  after.png captured: ${afterSize} bytes`);

  // Compare before/after
  const beforeBuf = fs.readFileSync(path.join(proofDir, "before.png"));
  const afterBuf = fs.readFileSync(path.join(proofDir, "after.png"));
  const identical = beforeBuf.equals(afterBuf);
  log(`  BEFORE vs AFTER identical: ${identical}`);
  if (identical) {
    log("  ⚠️  WARNING: Screenshots are byte-identical. The UI state did NOT change.");
  } else {
    log("  ✅ Screenshots differ. UI state changed between BEFORE and AFTER.");
  }

  // ──────────── STEP 6: Stop tracing and save ────────────
  log("STEP 6: Stopping trace and saving artifacts...");
  await context.tracing.stop({ path: path.join(proofDir, "trace.zip") });
  log("  trace.zip saved.");

  // Close and save video
  await page.close();
  await context.close();
  await browser.close();
  log("  Browser closed.");

  // Rename video file
  const videoFiles = fs.readdirSync(proofDir).filter(f => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    fs.renameSync(path.join(proofDir, videoFiles[0]), path.join(proofDir, "video.webm"));
    log("  video.webm saved.");
  } else {
    log("  ⚠️  No video file generated.");
  }

  // Write logs
  fs.writeFileSync(path.join(proofDir, "console.log"), consoleLogs.join("\n"));
  fs.writeFileSync(path.join(proofDir, "playwright.log"), playwrightLog.join("\n"));

  // Generate self-contained dashboard.html with Base64 images
  log("Generating dashboard.html with embedded Base64 images...");

  const images = {};
  for (const f of fs.readdirSync(proofDir).filter(f => f.endsWith('.png'))) {
    const buf = fs.readFileSync(path.join(proofDir, f));
    images[f] = `data:image/png;base64,${buf.toString('base64')}`;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EPIC-0006 Proof Package</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #1e1e1e; color: #d4d4d4; margin: 20px; max-width: 1400px; margin: 0 auto; padding: 20px; }
    h1 { color: #569cd6; }
    h2 { color: #ce9178; border-bottom: 1px solid #333; padding-bottom: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .card { background: #252526; padding: 15px; border-radius: 8px; border: 1px solid #3c3c3c; }
    .card h3 { margin-top: 0; }
    .card.before h3 { color: #ce9178; }
    .card.after h3 { color: #4ec9b0; }
    img { width: 100%; border-radius: 4px; border: 1px solid #555; }
    pre { background: #1a1a1a; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 12px; line-height: 1.5; max-height: 400px; overflow-y: auto; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; }
    .badge.pass { background: #28a745; color: white; }
    .badge.warn { background: #ffc107; color: black; }
    .badge.fail { background: #dc3545; color: white; }
    .artifact-list { list-style: none; padding: 0; }
    .artifact-list li { padding: 8px 0; border-bottom: 1px solid #333; }
    .artifact-list li a { color: #569cd6; text-decoration: none; }
  </style>
</head>
<body>
  <h1>🛡️ EPIC-0006 Document Editor — Single Scenario Proof Package</h1>
  <p>Generated: ${new Date().toISOString()}</p>
  <p>Before/After Identical: <span class="badge ${identical ? 'warn' : 'pass'}">${identical ? 'YES (no state change)' : 'NO (state changed ✅)'}</span></p>

  <h2>📷 BEFORE vs AFTER</h2>
  <div class="grid">
    <div class="card before">
      <h3>📷 BEFORE Action</h3>
      <p>Size: ${beforeSize} bytes</p>
      ${images['before.png'] ? `<img src="${images['before.png']}" alt="Before" />` : '<p>Not captured</p>'}
    </div>
    <div class="card after">
      <h3>📷 AFTER Action</h3>
      <p>Size: ${afterSize} bytes</p>
      ${images['after.png'] ? `<img src="${images['after.png']}" alt="After" />` : '<p>Not captured</p>'}
    </div>
  </div>

  <h2>📷 Step-by-Step Screenshots</h2>
  <div class="grid">
    ${Object.entries(images).filter(([k]) => k.startsWith('step')).map(([name, src]) => `
    <div class="card">
      <h3>${name}</h3>
      <img src="${src}" alt="${name}" />
    </div>`).join('')}
  </div>

  <h2>📋 Playwright Execution Log</h2>
  <pre>${playwrightLog.join('\n')}</pre>

  <h2>🖥️ Browser Console Log</h2>
  <pre>${consoleLogs.length > 0 ? consoleLogs.join('\n') : '(no console messages captured)'}</pre>

  <h2>📦 Artifacts in proof/</h2>
  <ul class="artifact-list">
    ${fs.readdirSync(proofDir).map(f => {
      const size = fs.statSync(path.join(proofDir, f)).size;
      return `<li><a href="${f}">${f}</a> — ${(size / 1024).toFixed(1)} KB</li>`;
    }).join('\n    ')}
  </ul>

  <h2>🔎 DOM Inspection (Before State)</h2>
  <pre>${JSON.stringify(beforeState, null, 2)}</pre>
</body>
</html>`;

  fs.writeFileSync(path.join(proofDir, "dashboard.html"), html);
  log("dashboard.html generated.");

  // Final summary
  log("=== PROOF PACKAGE COMPLETE ===");
  const artifacts = fs.readdirSync(proofDir);
  log(`Artifacts in proof/:`);
  for (const f of artifacts) {
    const size = fs.statSync(path.join(proofDir, f)).size;
    log(`  ${f} — ${(size / 1024).toFixed(1)} KB`);
  }
}

runProof().catch(err => {
  log(`FATAL ERROR: ${err.message}`);
  log(err.stack);
  fs.writeFileSync(path.join(proofDir, "playwright.log"), playwrightLog.join("\n"));
  fs.writeFileSync(path.join(proofDir, "console.log"), consoleLogs.join("\n"));
  process.exit(1);
});
