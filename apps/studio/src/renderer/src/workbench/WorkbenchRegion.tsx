/**
 * WorkbenchRegion.tsx — Generic container for workbench regions.
 *
 * Renders tabs for all panels contributed to this region, and renders
 * the component of the currently active panel.
 */

import { Panel } from "@ocs/ui";
import React from "react";

import type { RegionDescriptor, PanelPosition } from "./LayoutDescriptor.js";
import { usePanelsForPosition, usePanelRegistry } from "./PanelRegistry.js";

interface WorkbenchRegionProps {
  region: RegionDescriptor;
  position: PanelPosition;
  orientation: "vertical" | "horizontal";
  onActivePanelChange: (panelId: string) => void;
  isResizing: boolean;
  hideTabs?: boolean;
}

export const WorkbenchRegion: React.FC<WorkbenchRegionProps> = ({
  region,
  position,
  orientation,
  onActivePanelChange,
  isResizing,
  hideTabs
}) => {
  const registry = usePanelRegistry();
  const allPanels = usePanelsForPosition(position);

  // Filter to panels explicitly included in this region's layout state
  const activePanels = allPanels.filter((p) => region.panelIds.includes(p.id));

  if (!region.visible || activePanels.length === 0) {
    return null;
  }

  const activePanelId = region.activePanelId || activePanels[0]?.id;
  const activePanel = registry.get(activePanelId);

  const isVertical = orientation === "vertical";
  const sizeStyle = isVertical ? { width: `${region.width}px` } : { height: `${region.height}px` };

  // ── Tab Styling ───────────────────────────────────────────

  const getTabStyle = (isActive: boolean) => ({
    fontSize: "13px",
    fontWeight: 500,
    color: isActive ? "var(--workbench-text)" : "var(--workbench-text-muted)",
    border: "none",
    background: "none",
    borderBottom: isActive ? "2px solid var(--workbench-accent)" : "2px solid transparent",
    padding: "8px 0",
    marginRight: "20px",
    cursor: "pointer",
    transition:
      "color var(--motion-duration-fast) var(--motion-ease), border-color var(--motion-duration-fast) var(--motion-ease)"
  });

  return (
    <Panel
      direction="column"
      backgroundColor="var(--workbench-panel)"
      style={{
        ...sizeStyle,
        flexShrink: 0,
        userSelect: isResizing ? "none" : "auto",
        display: "flex",
        flexDirection: "column"
      }}
      aria-label={`${position} Region`}
    >
      {/* Tab Header */}
      {!hideTabs && (
        <div
          role="tablist"
          style={{
            display: "flex",
            backgroundColor: "var(--workbench-panel)",
            padding: "0 var(--spacing-lg)",
            height: "30px",
            alignItems: "center",
            borderBottom: "1px solid var(--workbench-border)",
            flexShrink: 0,
            overflowX: "auto"
          }}
        >
          {activePanels.map((panel) => {
            const isActive = panel.id === activePanelId;
            return (
              <button
                key={panel.id}
                role="tab"
                aria-selected={isActive}
                className="ocs-focus-ring"
                style={getTabStyle(isActive)}
                onClick={() => onActivePanelChange(panel.id)}
              >
                {panel.title}
              </button>
            );
          })}

          <div style={{ flex: 1 }} />
          <div
            id={`workbench-panel-actions-${position}`}
            style={{ display: "flex", alignItems: "center" }}
          ></div>
        </div>
      )}

      {/* Active Panel Content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {activePanel ? <activePanel.component /> : null}
      </div>
    </Panel>
  );
};
