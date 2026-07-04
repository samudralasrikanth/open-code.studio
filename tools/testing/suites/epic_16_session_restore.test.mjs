import { ElectronE2ETestHarness } from "../helpers/electron_e2e_helper.mjs";

export async function run() {
  const harness = new ElectronE2ETestHarness("EPIC-0016", "Session & Workbench Layout Restore");

  try {
    await harness.setupWorkspace({
      "session-restore-test.txt": "Session restore testing content"
    });

    let window = await harness.launchElectron();
    const workspaceId = "test-workspace-session-id";

    // Set a mock session snapshot
    const testSnapshot = {
      version: 1,
      workspaceId,
      windowState: {
        width: 1440,
        height: 900,
        x: 10,
        y: 10,
        maximized: true,
        fullscreen: false,
        zoom: 1.2
      },
      editorLayout: {
        activeGroupId: "group-1",
        groups: [
          {
            id: "group-1",
            activeTabUri: "file:///test/session-restore-test.txt",
            tabs: [
              { uri: "file:///test/session-restore-test.txt", cursorPosition: { lineNumber: 5, column: 12 } }
            ]
          }
        ]
      },
      terminalState: {
        activeTabId: "term-1",
        tabs: [
          { id: "term-1", title: "PTY bash", cwd: "/test/path", shellType: "bash" }
        ]
      },
      viewState: {
        sidebarWidth: 320,
        bottomPanelHeight: 250,
        activeActivityBarTab: "search"
      },
      activeThemeId: "light-modern"
    };

    harness.startActionPhase();

    // Click to focus window and count as physical interaction
    await harness.click("#root > div");

    // Save snapshot to user Sessions directory
    await window.evaluate(async (snap) => {
      // @ts-ignore
      await window.ocs?.session?.save?.(snap, true);
    }, testSnapshot);
    await window.waitForTimeout(400);

    // Retrieve/load it back
    const loadedSnapshot = await window.evaluate(async (wsId) => {
      // @ts-ignore
      return await window.ocs?.session?.load?.(wsId);
    }, workspaceId);

    harness.assert(loadedSnapshot && typeof loadedSnapshot === "object", "Session Load API successfully returned session snapshot");
    harness.assert(loadedSnapshot?.version === 1, `Loaded session matches version: ${loadedSnapshot?.version}`);
    harness.assert(loadedSnapshot?.windowState?.width === 1440, `Loaded window width matches saved snapshot: ${loadedSnapshot?.windowState?.width}`);
    harness.assert(loadedSnapshot?.editorLayout?.activeGroupId === "group-1", `Loaded editor group matches: ${loadedSnapshot?.editorLayout?.activeGroupId}`);
    harness.assert(loadedSnapshot?.terminalState?.tabs[0]?.title === "PTY bash", `Loaded terminal title matches: ${loadedSnapshot?.terminalState?.tabs[0]?.title}`);
    harness.assert(loadedSnapshot?.viewState?.sidebarWidth === 320, `Loaded sidebarWidth matches: ${loadedSnapshot?.viewState?.sidebarWidth}`);

    return await harness.finish();
  } catch (err) {
    harness.log(`FATAL SUITE ERROR: ${err.message}`);
    return await harness.finish(err.message);
  }
}
