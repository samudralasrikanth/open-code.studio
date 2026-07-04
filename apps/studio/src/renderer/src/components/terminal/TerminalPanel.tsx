import React, { useState, useEffect } from "react";

import { TerminalView } from "./TerminalView.js";

export const TerminalPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
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

  if (!isOpen) {
    return (
      <div style={{ backgroundColor: "#252526", borderTop: "1px solid #333", display: "flex" }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: "none",
            border: "none",
            color: "#ccc",
            padding: "4px 8px",
            cursor: "pointer",
            fontSize: "12px",
            textTransform: "uppercase"
          }}
        >
          Open Terminal
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "200px",
        backgroundColor: "#1e1e1e"
      }}
    >
      {/* Terminal Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#252526",
          padding: "4px 16px",
          borderTop: "1px solid #333",
          borderBottom: "1px solid #333"
        }}
      >
        <span
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            fontWeight: "bold",
            color: "#ccc"
          }}
        >
          Terminal
        </span>
        <div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "#ccc",
              cursor: "pointer",
              fontSize: "12px"
            }}
            title="Close Terminal"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Terminal Content Area */}
      <div style={{ flex: 1, padding: "8px", overflow: "hidden" }}>
        <TerminalView cwd={cwd} />
      </div>
    </div>
  );
};
