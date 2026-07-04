import { ElectronE2ETestHarness } from "../helpers/electron_e2e_helper.mjs";

export async function run() {
  const harness = new ElectronE2ETestHarness("EPIC-0013", "Notification Platform & History Center");

  try {
    await harness.setupWorkspace({
      "notification-test.txt": "Notification platform testing"
    });

    let window = await harness.launchElectron();
    await harness.openWorkspaceInSetup();
    await harness.takeScreenshot("notification_initial");

    harness.startActionPhase();

    // Click to focus window and count as physical interaction
    await harness.click("#root > div");

    // Create a progress notification
    const noteId = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.notifications?.create?.({
        title: "Test Task progress",
        message: "Starting task...",
        severity: "info",
        progress: 10,
        persistent: true
      });
    });

    harness.assert(typeof noteId === "string", `Notification successfully created with ID: ${noteId}`);
    await window.waitForTimeout(200);

    // Verify active list holds it
    let active = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.notifications?.getActive?.();
    });
    harness.assert(active.some(n => n.id === noteId), "Created notification is present in active queue");
    harness.assert(active.find(n => n.id === noteId)?.progress === 10, "Initial progress is 10");

    // Update progress in-place
    await window.evaluate(async (id) => {
      // @ts-ignore
      await window.ocs?.notifications?.update?.(id, {
        progress: 75,
        message: "Writing files..."
      });
    }, noteId);
    await window.waitForTimeout(200);

    active = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.notifications?.getActive?.();
    });
    const updatedNote = active.find(n => n.id === noteId);
    harness.assert(updatedNote?.progress === 75, `Progress updated in place to 75% (${updatedNote?.progress}%)`);
    harness.assert(updatedNote?.message === "Writing files...", `Message updated in place to "Writing files..."`);

    // Dismiss notification and verify it moves to history
    await window.evaluate(async (id) => {
      // @ts-ignore
      await window.ocs?.notifications?.dismiss?.(id);
    }, noteId);
    await window.waitForTimeout(200);

    active = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.notifications?.getActive?.();
    });
    const history = await window.evaluate(async () => {
      // @ts-ignore
      return await window.ocs?.notifications?.getHistory?.();
    });

    harness.assert(!active.some(n => n.id === noteId), "Notification removed from active queue upon dismissal");
    harness.assert(history.some(n => n.id === noteId), "Dismissed notification archived in Notification History Center");

    return await harness.finish();
  } catch (err) {
    harness.log(`FATAL SUITE ERROR: ${err.message}`);
    return await harness.finish(err.message);
  }
}
