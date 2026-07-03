import React from "react";

import { useExplorer } from "../../hooks/useExplorer.js";

interface StatusBarProps {
  workspaceName?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ workspaceName }) => {
  const { stats, isLoading } = useExplorer();

  const fileCount = stats?.totalNodes ?? 0;
  const explorerReady = !isLoading && fileCount > 0;

  return (
    <footer
      style={{
        height: "22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        backgroundColor: "#007acc",
        color: "#fff",
        fontSize: "11px",
        flexShrink: 0
      }}
    >
      <div style={{ display: "flex", gap: "16px" }}>
        <span>Ready</span>
        {workspaceName && <span>Workspace: {workspaceName}</span>}
        <span>Explorer: {explorerReady ? "Healthy" : "Idle"}</span>
        <span>{fileCount.toLocaleString()} Files</span>
      </div>
      <div style={{ display: "flex", gap: "16px" }}>
        <span>Git: Not Loaded</span>
        <span>AI: Not Loaded</span>
      </div>
    </footer>
  );
};
