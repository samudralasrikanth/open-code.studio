import { Panel, IconButton } from "@ocs/ui";
import { SettingsIcon, UserIcon } from "@ocs/ui";
import React from "react";

import { executeRendererCommand } from "../../commands/RendererCommandRegistry.js";
import { usePanelsForPosition } from "../../workbench/PanelRegistry.js";

interface ActivityBarProps {
  activePanelId?: string;
  onPanelSelect: (id: string) => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({ activePanelId, onPanelSelect }) => {
  const primaryPanels = usePanelsForPosition("primary-sidebar");

  const getIconStyle = (isActive: boolean) => ({
    width: "36px",
    height: "36px",
    borderRadius: "var(--radius-sm)",
    transition: "all var(--motion-duration-fast) var(--motion-ease)",
    color: isActive ? "var(--workbench-text)" : "var(--workbench-text-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });

  return (
    <Panel
      direction="column"
      backgroundColor="var(--workbench-panel)"
      borderRight="1px solid var(--workbench-border)"
      style={{
        width: "48px",
        height: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "var(--spacing-sm) 0",
        flexShrink: 0
      }}
      aria-label="Activity Bar"
    >
      {/* Top Icons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-md)",
          width: "100%",
          alignItems: "center"
        }}
      >
        {primaryPanels.map((panel) => {
          const isActive = activePanelId === panel.id;
          return (
            <div
              key={panel.id}
              style={{
                position: "relative",
                width: "100%",
                display: "flex",
                justifyContent: "center"
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "3px",
                    height: "24px",
                    backgroundColor: "var(--workbench-accent)",
                    borderRadius: "0 3px 3px 0"
                  }}
                />
              )}
              <IconButton
                active={isActive}
                onClick={() => onPanelSelect(panel.id)}
                title={panel.title}
                className="ocs-focus-ring"
                style={getIconStyle(isActive)}
                aria-label={panel.title}
              >
                {panel.icon}
              </IconButton>
            </div>
          );
        })}
      </div>

      {/* Bottom Icons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-md)",
          width: "100%",
          alignItems: "center",
          marginBottom: "var(--spacing-md)"
        }}
      >
        <div
          style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}
        >
          <IconButton
            title="Accounts"
            className="ocs-focus-ring"
            style={getIconStyle(false)}
            onClick={() => {
              // Placeholder for account/user action
            }}
          >
            <UserIcon size={24} />
          </IconButton>
        </div>
        <div
          style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}
        >
          <IconButton
            title="Settings"
            className="ocs-focus-ring"
            style={getIconStyle(false)}
            onClick={() => {
              void executeRendererCommand("workbench.action.openSettings");
            }}
          >
            <SettingsIcon size={24} />
          </IconButton>
        </div>
      </div>
    </Panel>
  );
};
