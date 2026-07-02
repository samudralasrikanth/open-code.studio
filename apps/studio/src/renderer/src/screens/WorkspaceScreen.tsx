import React from "react";

import { DeveloperDiagnosticsPanel } from "../components/explorer/DeveloperDiagnosticsPanel.js";
import { ExplorerPanel } from "../components/explorer/ExplorerPanel.js";

export const WorkspaceScreen: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#1e1e1e",
        color: "#ccc"
      }}
    >
      {/* Activity Bar Placeholder */}
      <div style={{ width: "48px", backgroundColor: "#333333", borderRight: "1px solid #252526" }}>
        <div
          style={{
            padding: "12px",
            textAlign: "center",
            cursor: "pointer",
            borderLeft: "2px solid #007acc"
          }}
        >
          <span title="Explorer" style={{ fontSize: "20px" }}>
            🗂️
          </span>
        </div>
      </div>

      {/* Sidebar - Explorer */}
      <div
        style={{
          width: "250px",
          backgroundColor: "#252526",
          borderRight: "1px solid #2d2d2d",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            textTransform: "uppercase",
            fontSize: "11px",
            fontWeight: "bold"
          }}
        >
          Explorer
        </div>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <ExplorerPanel />
          </div>
          <DeveloperDiagnosticsPanel />
        </div>
      </div>

      {/* Editor Area Placeholder */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#1e1e1e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div style={{ textAlign: "center", opacity: 0.5 }}>
          <h1>Open-Code.Studio</h1>
          <p>Select a file to open</p>
        </div>
      </div>
    </div>
  );
};
