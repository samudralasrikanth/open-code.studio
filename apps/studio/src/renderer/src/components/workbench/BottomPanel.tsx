import { Panel } from "@ocs/ui";
import React, { useEffect, useState } from "react";

import { DeveloperDiagnosticsPanel } from "../explorer/DeveloperDiagnosticsPanel.js";
import { TerminalView } from "../terminal/TerminalView.js";

interface BottomPanelProps {
  height: number;
  isResizing: boolean;
  activeTab: "problems" | "output" | "terminal" | "diagnostics";
  onTabChange: (tab: "problems" | "output" | "terminal" | "diagnostics") => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  height,
  isResizing,
  activeTab,
  onTabChange
}) => {
  const [cwd, setCwd] = useState<string>("/");

  useEffect(() => {
    if (window.ocs?.workspace?.getActive) {
      window.ocs.workspace.getActive().then((ws) => {
        if (ws?.uri) {
          const pathStr = ws.uri.startsWith("file://") ? ws.uri.replace("file://", "") : ws.uri;
          setCwd(pathStr);
        }
      });
    }
  }, []);

  return (
    <Panel
      direction="column"
      backgroundColor="#1a1a1a"
      borderTop="1px solid #2d2d2d"
      style={{
        height: `${height}px`,
        flexShrink: 0,
        userSelect: isResizing ? "none" : "auto"
      }}
    >
      {/* Bottom Panel Tab Header */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#1e1e1e",
          padding: "0 16px",
          height: "30px",
          alignItems: "center",
          borderBottom: "1px solid #2d2d2d",
          flexShrink: 0
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            textTransform: "uppercase",
            color: activeTab === "problems" ? "#fff" : "#858585",
            borderBottom: activeTab === "problems" ? "2px solid #007acc" : "2px solid transparent",
            padding: "8px 0",
            marginRight: "20px",
            cursor: "pointer"
          }}
          onClick={() => setActiveTab("problems")}
        >
          Problems
        </div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            textTransform: "uppercase",
            color: activeTab === "output" ? "#fff" : "#858585",
            borderBottom: activeTab === "output" ? "2px solid #007acc" : "2px solid transparent",
            padding: "8px 0",
            marginRight: "20px",
            cursor: "pointer"
          }}
          onClick={() => setActiveTab("output")}
        >
          Output
        </div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            textTransform: "uppercase",
            color: activeTab === "terminal" ? "#fff" : "#858585",
            borderBottom: activeTab === "terminal" ? "2px solid #007acc" : "2px solid transparent",
            padding: "8px 0",
            marginRight: "20px",
            cursor: "pointer"
          }}
          onClick={() => setActiveTab("terminal")}
        >
          Terminal
        </div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            textTransform: "uppercase",
            color: activeTab === "diagnostics" ? "#fff" : "#858585",
            borderBottom:
              activeTab === "diagnostics" ? "2px solid #007acc" : "2px solid transparent",
            padding: "8px 0",
            cursor: "pointer"
          }}
          onClick={() => onTabChange("diagnostics")}
        >
          Diagnostics
        </div>
      </div>

      {/* Bottom Panel Content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", backgroundColor: "#1e1e1e" }}>
        {activeTab === "terminal" && <TerminalView cwd={cwd} />}
        {activeTab === "diagnostics" && <DeveloperDiagnosticsPanel />}
      </div>
    </Panel>
  );
};
