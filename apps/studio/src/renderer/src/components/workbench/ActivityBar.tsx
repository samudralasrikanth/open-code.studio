import { Panel, IconButton } from "@ocs/ui";
import {
  FolderIcon,
  SearchIcon,
  SourceControlIcon,
  RunDebugIcon,
  ExtensionsIcon,
  SettingsIcon
} from "@ocs/ui";
import React from "react";

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, onViewChange }) => {
  return (
    <Panel
      direction="column"
      backgroundColor="#181818"
      borderRight="1px solid #252526"
      style={{
        width: "48px",
        height: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        flexShrink: 0
      }}
    >
      {/* Top Icons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          alignItems: "center"
        }}
      >
        <IconButton
          active={activeView === "explorer"}
          onClick={() => onViewChange("explorer")}
          title="Explorer"
          style={{
            width: "36px",
            height: "36px",
            borderLeft: activeView === "explorer" ? "2px solid #007acc" : "2px solid transparent",
            borderRadius: "0"
          }}
        >
          <FolderIcon size={22} />
        </IconButton>

        <IconButton
          active={activeView === "search"}
          onClick={() => onViewChange("search")}
          title="Search"
          style={{
            width: "36px",
            height: "36px",
            borderLeft: activeView === "search" ? "2px solid #007acc" : "2px solid transparent",
            borderRadius: "0"
          }}
        >
          <SearchIcon size={22} />
        </IconButton>

        <IconButton
          active={activeView === "source-control"}
          onClick={() => onViewChange("source-control")}
          title="Source Control"
          style={{
            width: "36px",
            height: "36px",
            borderLeft:
              activeView === "source-control" ? "2px solid #007acc" : "2px solid transparent",
            borderRadius: "0"
          }}
        >
          <SourceControlIcon size={22} />
        </IconButton>

        <IconButton
          disabled
          title="Run & Debug (Disabled)"
          style={{ width: "36px", height: "36px", opacity: 0.3 }}
        >
          <RunDebugIcon size={22} />
        </IconButton>

        <IconButton
          disabled
          title="Extensions (Disabled)"
          style={{ width: "36px", height: "36px", opacity: 0.3 }}
        >
          <ExtensionsIcon size={22} />
        </IconButton>
      </div>

      {/* Bottom Icons */}
      <div
        style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <IconButton
          disabled
          title="Settings (Disabled)"
          style={{ width: "36px", height: "36px", opacity: 0.3 }}
        >
          <SettingsIcon size={22} />
        </IconButton>
      </div>
    </Panel>
  );
};
