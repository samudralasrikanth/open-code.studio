import React from "react";

import { useExplorer } from "../../hooks/useExplorer.js";

export const EditorArea: React.FC = () => {
  const { nodes, stats } = useExplorer();

  const selectedNodeIds = stats?.selectedNodeIds as string[] | undefined;
  const selectedId = selectedNodeIds?.[0];
  const selectedNode = selectedId
    ? nodes.find((n) => n.node.id === selectedId && !n.node.isDirectory)
    : null;
  const selectedFile = selectedNode ? selectedNode.node.name : null;

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#1e1e1e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 0
      }}
    >
      <div style={{ textAlign: "center", opacity: 0.6, maxWidth: "400px", padding: "24px" }}>
        {selectedFile ? (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
            <h2 style={{ fontSize: "16px", fontWeight: 500, margin: "0 0 8px", color: "#ccc" }}>
              {selectedFile}
            </h2>
            <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
              Editor Platform coming in EPIC-6
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⬡</div>
            <h2 style={{ fontSize: "18px", fontWeight: 500, margin: "0 0 8px", color: "#ccc" }}>
              Open-Code.Studio
            </h2>
            <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>Select a file to open</p>
          </>
        )}
      </div>
    </div>
  );
};
