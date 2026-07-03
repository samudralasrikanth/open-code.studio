import React, { useEffect, useState } from "react";

interface StatusBarProps {
  workspaceName?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ workspaceName }) => {
  const [fileCount, setFileCount] = useState(0);
  const [explorerReady, setExplorerReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const refresh = async (): Promise<void> => {
      try {
        const stats = await window.ocs.explorer.getStats();
        if (mounted) {
          setFileCount(stats.totalNodes);
          setExplorerReady(stats.totalNodes > 0);
        }
      } catch {
        if (mounted) {
          setExplorerReady(false);
        }
      }
    };

    void refresh();
    const unsubscribe = window.ocs.explorer.onStateChanged(() => {
      void refresh();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

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
