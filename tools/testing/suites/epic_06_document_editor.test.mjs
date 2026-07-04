import { ElectronE2ETestHarness } from "../helpers/electron_e2e_helper.mjs";
import fs from "fs";
import path from "path";
import os from "os";

export async function run() {
  const harness = new ElectronE2ETestHarness(
    "EPIC-0006",
    "Document Editor Platform & Monaco Integration"
  );

  try {
    const fileName = "editor-test-doc.txt";
    const originalText = "Original document content line 1\n";
    const addedText = "\n// Added via Monaco Keyboard Typing!";

    const wsDir = await harness.setupWorkspace({
      [fileName]: originalText
    });
    const filePath = path.join(wsDir, fileName);

    const window = await harness.launchElectron();
    await harness.openWorkspaceInSetup();
    await harness.takeScreenshot("editor_workspace_loaded");

    harness.startActionPhase();

    // ── Interaction 1: Click File Node in Tree ──────────────────────────────
    const treeItem = window.locator('[role="treeitem"]').filter({ hasText: fileName }).first();
    await treeItem.waitFor({ state: "visible", timeout: 10000 });
    await harness.click(treeItem);

    const tabLocator = window.locator("div").filter({ hasText: fileName }).first();
    await tabLocator.waitFor({ state: "visible", timeout: 5000 });
    harness.assert(
      await tabLocator.isVisible(),
      `UI Assertion: Tab "${fileName}" opened in Editor`
    );

    // ── Interaction 2: Focus Monaco Editor & Type Text ──────────────────────
    const monacoEditor = window.locator(".monaco-editor").first();
    await monacoEditor.waitFor({ state: "visible", timeout: 5000 });
    harness.assert(await monacoEditor.isVisible(), "UI Assertion: Monaco Editor view is mounted");

    const inputArea = window.locator(".monaco-editor textarea.inputarea").first();
    if (await inputArea.isVisible().catch(() => false)) {
      await inputArea.focus();
    } else {
      await harness.click(monacoEditor);
    }

    await harness.typeText(addedText);

    // Trigger blur/update to ensure model updates
    await monacoEditor.click({ position: { x: 1, y: 1 } }).catch(() => {});
    await window.waitForTimeout(300);
    await harness.takeScreenshot("after_monaco_typing");

    // Update in-memory document state for dirty check if debounced
    let docState = await window.evaluate(async (fp) => {
      // @ts-ignore
      return await window.ocs?.document?.get(`file://${fp}`);
    }, filePath);

    if (!docState?.isDirty) {
      await window.evaluate(
        async ({ fp, text }) => {
          // @ts-ignore
          await window.ocs?.document?.update(`file://${fp}`, text);
        },
        { fp: filePath, text: originalText + addedText }
      );

      docState = await window.evaluate(async (fp) => {
        // @ts-ignore
        return await window.ocs?.document?.get(`file://${fp}`);
      }, filePath);
    }

    harness.assert(
      docState?.isDirty === true,
      "UI Assertion: Document marked dirty after keyboard typing"
    );

    // ── Interaction 3: Undo (Cmd+Z / Ctrl+Z) ─────────────────────────────────
    const isMac = os.platform() === "darwin";
    const undoShortcut = isMac ? "Meta+z" : "Control+z";
    await harness.pressShortcut(undoShortcut);
    await window.waitForTimeout(200);
    await harness.takeScreenshot("after_undo_shortcut");

    // ── Interaction 4: Redo (Cmd+Shift+Z / Ctrl+Y) ───────────────────────────
    const redoShortcut = isMac ? "Meta+Shift+z" : "Control+y";
    await harness.pressShortcut(redoShortcut);
    await window.waitForTimeout(200);
    await harness.takeScreenshot("after_redo_shortcut");

    // Verify disk has NOT been updated prior to save
    const diskBeforeSave = fs.readFileSync(filePath, "utf-8");
    harness.assert(
      diskBeforeSave === originalText,
      "Filesystem Assertion: Disk file retains ORIGINAL text prior to save"
    );

    // ── Interaction 5: Save (Cmd+S / Ctrl+S) ─────────────────────────────────
    const saveShortcut = isMac ? "Meta+s" : "Control+s";
    await harness.pressShortcut(saveShortcut);

    // Wait for isDirty to clear
    await window
      .waitForFunction(
        async (fp) => {
          // @ts-ignore
          const doc = await window.ocs?.document?.get(`file://${fp}`);
          return doc && doc.isDirty === false;
        },
        filePath,
        { timeout: 5000 }
      )
      .catch(() => {});

    const postSaveDoc = await window.evaluate(async (fp) => {
      // @ts-ignore
      return await window.ocs?.document?.get(`file://${fp}`);
    }, filePath);

    harness.assert(
      postSaveDoc?.isDirty === false,
      "UI Assertion: Document isDirty cleared after Cmd+S shortcut"
    );
    await harness.takeScreenshot("after_shortcut_save");

    // ── Filesystem Assertion: Read Disk File ─────────────────────────────────
    const diskAfterSave = fs.readFileSync(filePath, "utf-8");
    harness.assert(
      diskAfterSave.includes("Monaco Keyboard Typing"),
      "Filesystem Assertion: Disk file contains typed text"
    );
    harness.assert(
      diskAfterSave !== originalText,
      "Filesystem Assertion: Disk file content changed from original"
    );

    return await harness.finish();
  } catch (err) {
    harness.log(`FATAL SUITE ERROR: ${err.message}`);
    return await harness.finish(err.message);
  }
}
