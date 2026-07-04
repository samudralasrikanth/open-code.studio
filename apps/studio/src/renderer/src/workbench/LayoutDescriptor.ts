/**
 * LayoutDescriptor.ts — Serializable workbench layout model.
 *
 * This is the single source of truth for "what the workbench looks like."
 * It is pure types with no React dependency — testable independently.
 */

// ── Panel Position ──────────────────────────────────────────

/** Where a panel can be rendered within the workbench. */
export type PanelPosition = "primary-sidebar" | "secondary-sidebar" | "bottom" | "editor-overlay";

// ── Region Descriptor ───────────────────────────────────────

/** Serializable state for a single workbench region (sidebar or bottom panel). */
export interface RegionDescriptor {
  /** Whether this region is visible. */
  visible: boolean;
  /** Width in pixels (sidebars). */
  width?: number;
  /** Height in pixels (bottom panel). */
  height?: number;
  /** The currently active (visible) panel within this region. */
  activePanelId?: string;
  /** Ordered list of panel IDs contributed to this region. */
  panelIds: string[];
}

// ── Workbench Layout Descriptor ─────────────────────────────

/** Full serializable layout descriptor for the entire workbench. */
export interface WorkbenchLayoutDescriptor {
  activityBar: {
    visible: boolean;
    position: "left" | "right";
  };
  primarySidebar: RegionDescriptor;
  secondarySidebar: RegionDescriptor;
  bottomPanel: RegionDescriptor;
  statusBar: {
    visible: boolean;
  };
}

// ── Defaults ────────────────────────────────────────────────

/** Default layout for a fresh workbench — matches the current hardcoded layout. */
export const DEFAULT_LAYOUT: WorkbenchLayoutDescriptor = {
  activityBar: { visible: true, position: "left" },
  primarySidebar: {
    visible: true,
    width: 280,
    activePanelId: "explorer",
    panelIds: ["explorer", "search", "source-control"]
  },
  secondarySidebar: {
    visible: false,
    width: 360,
    activePanelId: undefined,
    panelIds: []
  },
  bottomPanel: {
    visible: true,
    height: 220,
    activePanelId: "terminal",
    panelIds: ["problems", "output", "terminal", "diagnostics"]
  },
  statusBar: { visible: true }
};

// ── Helpers ─────────────────────────────────────────────────

/** Deep-clone a layout descriptor (for creating mode overlays). */
export function cloneLayout(layout: WorkbenchLayoutDescriptor): WorkbenchLayoutDescriptor {
  return JSON.parse(JSON.stringify(layout)) as WorkbenchLayoutDescriptor;
}

/** Apply a partial overlay onto a base layout (for mode switching). */
export function mergeLayout(
  base: WorkbenchLayoutDescriptor,
  overlay: Partial<WorkbenchLayoutDescriptor>
): WorkbenchLayoutDescriptor {
  const merged = cloneLayout(base);
  if (overlay.activityBar) Object.assign(merged.activityBar, overlay.activityBar);
  if (overlay.primarySidebar) Object.assign(merged.primarySidebar, overlay.primarySidebar);
  if (overlay.secondarySidebar) Object.assign(merged.secondarySidebar, overlay.secondarySidebar);
  if (overlay.bottomPanel) Object.assign(merged.bottomPanel, overlay.bottomPanel);
  if (overlay.statusBar) Object.assign(merged.statusBar, overlay.statusBar);
  return merged;
}
