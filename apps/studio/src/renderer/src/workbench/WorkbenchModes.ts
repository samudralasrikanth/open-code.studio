/**
 * WorkbenchModes.ts — Named layout presets for mode switching.
 *
 * Modes are partial layout overlays. Switching mode = applying
 * a preset overlay onto the current base layout.
 */

import { useState, useCallback } from "react";

import type { WorkbenchLayoutDescriptor } from "./LayoutDescriptor.js";

// ── Mode Types ──────────────────────────────────────────────

export type WorkbenchMode =
  "editor" | "chat" | "testing" | "debug" | "git" | "agent" | "review" | "focus";

// ── Mode Presets ────────────────────────────────────────────

/** Each preset only overrides what changes — other regions stay as-is. */
export const MODE_PRESETS: Record<WorkbenchMode, Partial<WorkbenchLayoutDescriptor>> = {
  editor: {
    primarySidebar: {
      visible: true,
      width: 280,
      activePanelId: "explorer",
      panelIds: ["explorer", "search", "source-control"]
    },
    secondarySidebar: { visible: false, width: 360, panelIds: [] },
    bottomPanel: {
      visible: true,
      height: 220,
      activePanelId: "terminal",
      panelIds: ["problems", "output", "terminal", "diagnostics"]
    }
  },

  chat: {
    secondarySidebar: {
      visible: true,
      width: 420,
      activePanelId: "chat",
      panelIds: ["chat"]
    }
  },

  testing: {
    primarySidebar: {
      visible: true,
      width: 300,
      activePanelId: "test-explorer",
      panelIds: ["test-explorer", "explorer"]
    },
    bottomPanel: {
      visible: true,
      height: 280,
      activePanelId: "test-results",
      panelIds: ["test-results", "terminal", "output"]
    }
  },

  debug: {
    primarySidebar: {
      visible: true,
      width: 300,
      activePanelId: "variables",
      panelIds: ["variables", "watch", "callstack", "breakpoints"]
    },
    bottomPanel: {
      visible: true,
      height: 250,
      activePanelId: "debug-console",
      panelIds: ["debug-console", "terminal"]
    }
  },

  git: {
    primarySidebar: {
      visible: true,
      width: 320,
      activePanelId: "source-control",
      panelIds: ["source-control", "explorer"]
    },
    bottomPanel: {
      visible: true,
      height: 200,
      activePanelId: "terminal",
      panelIds: ["terminal", "output"]
    }
  },

  agent: {
    secondarySidebar: {
      visible: true,
      width: 440,
      activePanelId: "agent-queue",
      panelIds: ["agent-queue", "chat"]
    },
    bottomPanel: {
      visible: true,
      height: 200,
      activePanelId: "terminal",
      panelIds: ["terminal", "output"]
    }
  },

  review: {
    primarySidebar: {
      visible: true,
      width: 280,
      activePanelId: "source-control",
      panelIds: ["source-control", "explorer"]
    },
    secondarySidebar: {
      visible: true,
      width: 360,
      activePanelId: "comments",
      panelIds: ["comments"]
    }
  },

  focus: {
    primarySidebar: { visible: false, width: 280, panelIds: [] },
    secondarySidebar: { visible: false, width: 360, panelIds: [] },
    bottomPanel: { visible: false, height: 220, panelIds: [] },
    activityBar: { visible: false, position: "left" },
    statusBar: { visible: false }
  }
};

// ── Mode Hook ───────────────────────────────────────────────

interface UseWorkbenchModeReturn {
  /** The current active mode. */
  mode: WorkbenchMode;
  /** Set the active mode. */
  setMode: (mode: WorkbenchMode) => void;
  /** The mode that was active before the current one. */
  previousMode: WorkbenchMode | null;
  /** Get the layout preset for a mode. */
  getPreset: (mode: WorkbenchMode) => Partial<WorkbenchLayoutDescriptor>;
}

export function useWorkbenchMode(): UseWorkbenchModeReturn {
  const [mode, setModeState] = useState<WorkbenchMode>("editor");
  const [previousMode, setPreviousMode] = useState<WorkbenchMode | null>(null);

  const setMode = useCallback(
    (newMode: WorkbenchMode) => {
      setPreviousMode(mode);
      setModeState(newMode);
    },
    [mode]
  );

  const getPreset = useCallback((targetMode: WorkbenchMode): Partial<WorkbenchLayoutDescriptor> => {
    return MODE_PRESETS[targetMode] ?? {};
  }, []);

  return { mode, setMode, previousMode, getPreset };
}
