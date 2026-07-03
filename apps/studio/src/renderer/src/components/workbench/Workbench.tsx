import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { EditorArea } from "../editor/EditorArea.js";
import { DeveloperDiagnosticsPanel } from "../explorer/DeveloperDiagnosticsPanel.js";
import { ExplorerPanel } from "../explorer/ExplorerPanel.js";
import { StatusBar } from "./StatusBar.js";
import { TitleBar } from "./TitleBar.js";

export const Workbench: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workspaceName, setWorkspaceName] = useState<string>("");

  useEffect(() => {
    window.ocs?.workspace
      .getActive()
      .then((ws) => {
        if (ws) {
          setWorkspaceName(ws.displayName || ws.id);
        }
      })
      .catch(console.error);
  }, [id]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#1e1e1e",
        color: "#ccc",
        overflow: "hidden"
      }}
    >
      <TitleBar workspaceName={workspaceName} />

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Activity Bar */}
        <div
          style={{ width: "48px", backgroundColor: "#333333", borderRight: "1px solid #252526" }}
        >
          <div
            style={{
              padding: "12px",
              textAlign: "center",
              borderLeft: "2px solid #007acc"
            }}
            title="Explorer"
          >
            <span style={{ fontSize: "20px" }}>🗂️</span>
          </div>
        </div>

        {/* Sidebar — Explorer */}
        <div
          style={{
            width: "250px",
            backgroundColor: "#252526",
            borderRight: "1px solid #2d2d2d",
            display: "flex",
            flexDirection: "column",
            minHeight: 0
          }}
        >
          <div
            style={{
              padding: "10px 16px",
              textTransform: "uppercase",
              fontSize: "11px",
              fontWeight: "bold",
              flexShrink: 0
            }}
          >
            Explorer
          </div>
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
              <ExplorerPanel />
            </div>
            <DeveloperDiagnosticsPanel />
          </div>
        </div>

        {/* Editor Area */}
        <EditorArea />
      </div>

      <StatusBar workspaceName={workspaceName} />
    </div>
  );
};
