import { Panel, Toolbar, IconButton } from "@ocs/ui";
import { RefreshIcon, CollapseAllIcon, NewFileIcon, NewFolderIcon } from "@ocs/ui";
import React, { useState } from "react";

import { useExplorer } from "../../hooks/useExplorer.js";
import { ExplorerPanel } from "../explorer/ExplorerPanel.js";
import { SourceControlPanel } from "../git/SourceControlPanel.js";
import { SearchSidebar } from "../search/SearchSidebar.js";

interface SidebarProps {
  width: number;
  isResizing: boolean;
  activeView: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ width, isResizing, activeView }) => {
  const { nodes, collapseNode } = useExplorer();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCollapseAll = async () => {
    const expanded = nodes.filter((n) => n.node.isDirectory && n.isExpanded);
    for (const item of expanded) {
      await collapseNode(item.node.id);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (activeView === "search") {
    return (
      <Panel
        direction="column"
        backgroundColor="#252526"
        style={{
          width: `${width}px`,
          height: "100%",
          flexShrink: 0,
          userSelect: isResizing ? "none" : "auto"
        }}
      >
        <SearchSidebar />
      </Panel>
    );
  }

  if (activeView === "source-control") {
    return (
      <Panel
        direction="column"
        backgroundColor="#252526"
        style={{
          width: `${width}px`,
          height: "100%",
          flexShrink: 0,
          userSelect: isResizing ? "none" : "auto"
        }}
      >
        <SourceControlPanel />
      </Panel>
    );
  }

  return (
    <Panel
      direction="column"
      backgroundColor="#252526"
      style={{
        width: `${width}px`,
        height: "100%",
        flexShrink: 0,
        userSelect: isResizing ? "none" : "auto"
      }}
    >
      <Toolbar title="Explorer">
        <IconButton disabled title="New File (Disabled until EPIC-7)" style={{ opacity: 0.35 }}>
          <NewFileIcon size={14} />
        </IconButton>
        <IconButton disabled title="New Folder (Disabled until EPIC-7)" style={{ opacity: 0.35 }}>
          <NewFolderIcon size={14} />
        </IconButton>
        <IconButton
          onClick={handleRefresh}
          title="Refresh"
          style={{
            transform: isRefreshing ? "rotate(180deg)" : "none",
            transition: "transform 0.4s ease"
          }}
        >
          <RefreshIcon size={14} />
        </IconButton>
        <IconButton
          onClick={() => {
            void handleCollapseAll();
          }}
          title="Collapse All"
        >
          <CollapseAllIcon size={14} />
        </IconButton>
      </Toolbar>

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
          <ExplorerPanel />
        </div>
      </div>
    </Panel>
  );
};
