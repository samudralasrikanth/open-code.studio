/**
 * useWorkbenchLayout.ts — State management for the workbench layout.
 *
 * Replaces all scattered useState calls in Workbench.tsx with a single,
 * serializable layout descriptor. Persists to workspace settings.
 */

import { useState, useCallback, useEffect, useRef } from "react";

import { type WorkbenchLayoutDescriptor, DEFAULT_LAYOUT, cloneLayout } from "./LayoutDescriptor.js";

export interface UseWorkbenchLayoutReturn {
  /** The current layout state. */
  layout: WorkbenchLayoutDescriptor;

  /** Toggle a region's visibility. */
  toggleRegion(region: "primarySidebar" | "secondarySidebar" | "bottomPanel"): void;

  /** Set a region's width or height. */
  setRegionSize(region: "primarySidebar" | "secondarySidebar" | "bottomPanel", size: number): void;

  /** Set the active panel within a region. */
  setActivePanel(
    region: "primarySidebar" | "secondarySidebar" | "bottomPanel",
    panelId: string
  ): void;

  /** Replace the entire layout (used by mode switching). */
  applyLayout(descriptor: WorkbenchLayoutDescriptor): void;

  /** Persist current layout to workspace settings. */
  saveLayout(): Promise<void>;

  /** Which region is currently being resized (for CSS transition suppression). */
  resizingRegion: string | null;

  /** Set the currently resizing region. */
  setResizingRegion(region: string | null): void;
}

export function useWorkbenchLayout(): UseWorkbenchLayoutReturn {
  const [layout, setLayout] = useState<WorkbenchLayoutDescriptor>(() =>
    cloneLayout(DEFAULT_LAYOUT)
  );
  const [resizingRegion, setResizingRegion] = useState<string | null>(null);
  const layoutRef = useRef(layout);

  // Keep ref in sync for async closures
  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  // ── Restore from workspace settings on mount ──────────────
  useEffect(() => {
    const restore = async (): Promise<void> => {
      try {
        const ws = await window.ocs?.workspace?.getActive();
        if (!ws?.configuration?.settings) return;

        const saved = ws.configuration.settings["workbenchLayout"] as
          WorkbenchLayoutDescriptor | undefined;

        if (saved) {
          // Full layout restore
          setLayout(saved);
          return;
        }

        // Backward compatibility: migrate old sidebarWidth setting
        const legacyWidth = ws.configuration.settings["sidebarWidth"] as number | undefined;
        if (legacyWidth) {
          setLayout((prev) => ({
            ...prev,
            primarySidebar: { ...prev.primarySidebar, width: legacyWidth }
          }));
        }
      } catch {
        // Silently fall back to defaults
      }
    };

    void restore();
  }, []);

  // ── Region operations ─────────────────────────────────────

  const toggleRegion = useCallback(
    (region: "primarySidebar" | "secondarySidebar" | "bottomPanel") => {
      setLayout((prev) => ({
        ...prev,
        [region]: { ...prev[region], visible: !prev[region].visible }
      }));
    },
    []
  );

  const setRegionSize = useCallback(
    (region: "primarySidebar" | "secondarySidebar" | "bottomPanel", size: number) => {
      const key = region === "bottomPanel" ? "height" : "width";
      setLayout((prev) => ({
        ...prev,
        [region]: { ...prev[region], [key]: size }
      }));
    },
    []
  );

  const setActivePanel = useCallback(
    (region: "primarySidebar" | "secondarySidebar" | "bottomPanel", panelId: string) => {
      setLayout((prev) => {
        const regionState = prev[region];
        // If clicking the already-active panel, toggle region visibility
        if (regionState.activePanelId === panelId && regionState.visible) {
          return {
            ...prev,
            [region]: { ...regionState, visible: false }
          };
        }
        return {
          ...prev,
          [region]: { ...regionState, activePanelId: panelId, visible: true }
        };
      });
    },
    []
  );

  // ── Full layout operations ────────────────────────────────

  const applyLayout = useCallback((descriptor: WorkbenchLayoutDescriptor) => {
    setLayout(cloneLayout(descriptor));
  }, []);

  const saveLayout = useCallback(async (): Promise<void> => {
    try {
      if (window.ocs?.workspace?.updateSettings) {
        await window.ocs.workspace.updateSettings({
          workbenchLayout: layoutRef.current
        });
      }
    } catch {
      // Silently ignore persistence failures
    }
  }, []);

  return {
    layout,
    toggleRegion,
    setRegionSize,
    setActivePanel,
    applyLayout,
    saveLayout,
    resizingRegion,
    setResizingRegion
  };
}
