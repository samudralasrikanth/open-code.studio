import { StatusItem, GitBranchIcon, ErrorIcon, WarningIcon } from "@ocs/ui";
import React, { useEffect, useState } from "react";

import { useExplorer } from "../../hooks/useExplorer.js";
import { useWorkbenchMode } from "../../workbench/WorkbenchModes.js";

interface StatusBarProps {
  workspaceName?: string;
}

function getLanguageFromFilename(filename: string | null): string {
  if (!filename) return "";
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "md":
      return "Markdown";
    case "ts":
      return "TypeScript";
    case "tsx":
      return "TypeScript React";
    case "js":
      return "JavaScript";
    case "jsx":
      return "JavaScript React";
    case "json":
      return "JSON";
    case "html":
      return "HTML";
    case "css":
      return "CSS";
    case "yaml":
    case "yml":
      return "YAML";
    default:
      return "Plain Text";
  }
}

export const StatusBar: React.FC<StatusBarProps> = ({ workspaceName }) => {
  const { nodes, stats, isLoading } = useExplorer();
  const { mode } = useWorkbenchMode();
  const [branch, setBranch] = useState<string>("main");
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const fileCount = stats?.totalNodes ?? 0;
  const explorerReady = !isLoading && fileCount > 0;

  // Selected file detection
  const selectedNodeIds = stats?.selectedNodeIds as string[] | undefined;
  const selectedId = selectedNodeIds?.[0];
  const selectedNode = selectedId
    ? nodes.find((n) => n.node.id === selectedId && !n.node.isDirectory)
    : null;
  const selectedFile = selectedNode ? selectedNode.node.name : null;
  const language = getLanguageFromFilename(selectedFile);

  useEffect(() => {
    if (window.ocs?.git?.status) {
      window.ocs.git
        .status()
        .then((status) => {
          if (status) {
            setBranch(status.branch || "main");
            setIsDirty(status.files.length > 0);
          }
        })
        .catch(() => {});
    }
  }, []);

  const itemColorStyle = { color: "var(--workbench-text)", opacity: 0.9 };

  return (
    <footer
      style={{
        height: "22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 var(--spacing-md)",
        backgroundColor: "var(--workbench-panel)",
        color: "var(--workbench-text-muted)",
        borderTop: "1px solid var(--workbench-border)",
        fontSize: "12px",
        flexShrink: 0,
        fontFamily: "var(--font-sans)",
        userSelect: "none"
      }}
      aria-label="Status Bar"
    >
      {/* Left Block: Git, Problems, Workspace, Explorer status */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <StatusItem
          label={mode.toUpperCase()}
          style={{
            color: "var(--workbench-accent)",
            padding: "0 4px",
            height: "100%",
            fontWeight: 600,
            letterSpacing: "0.5px"
          }}
        />
        <StatusItem
          label="Remote"
          style={{
            backgroundColor: "#007acc",
            fontWeight: 600
          }}
        />
        {workspaceName && (
          <StatusItem label="Workspace:" value={workspaceName} style={itemColorStyle} />
        )}
        <StatusItem
          label="Explorer:"
          value={explorerReady ? "Healthy" : "Idle"}
          style={itemColorStyle}
        />
        <StatusItem value={`${fileCount.toLocaleString()} Files`} style={itemColorStyle} />

        {/* Dynamic Git Status Item on the Left */}
        {branch && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              color: "var(--workbench-text)",
              opacity: 0.9
            }}
            title={`Git branch: ${branch}${isDirty ? " (modified changes)" : ""}`}
          >
            <GitBranchIcon size={14} />
            <span>{branch}</span>
            {isDirty && <span style={{ color: "var(--color-warning)" }}>*</span>}
          </div>
        )}

        {/* Extensible Problems Badge (clickable keyboard target) */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "none",
            border: "none",
            color: "var(--workbench-text)",
            fontSize: "11px",
            padding: "0 var(--spacing-xs)",
            cursor: "pointer",
            outlineColor: "var(--workbench-accent)",
            opacity: 0.9
          }}
          title="0 Errors, 0 Warnings"
          aria-label="Problems: 0 errors, 0 warnings"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "var(--color-error)"
            }}
          >
            <ErrorIcon size={14} />
            <span>0</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "var(--color-warning)"
            }}
          >
            <WarningIcon size={14} />
            <span>0</span>
          </div>
        </button>
      </div>

      {/* Spacer (extensibility gap) */}
      <div style={{ flexGrow: 1 }} />

      {/* Right Block: File Specs, AI state, notifications */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)" }}>
        {selectedFile && (
          <>
            <StatusItem value="Ln 1, Col 1" style={itemColorStyle} />
            <StatusItem value="Spaces: 2" style={itemColorStyle} />
            <StatusItem value="UTF-8" style={itemColorStyle} />
            <StatusItem value="LF" style={itemColorStyle} />
            <StatusItem value={language} style={itemColorStyle} />
          </>
        )}

        {/* Extensible Premium AI Status Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "0 6px",
            color: "var(--workbench-text)",
            opacity: 0.85
          }}
        >
          <span
            className="animate-pulse"
            style={{
              width: "6px",
              height: "6px",
              backgroundColor: "var(--color-success)",
              borderRadius: "50%",
              display: "inline-block"
            }}
          />
          <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.03em" }}>
            ANTIGRAVITY ACTIVE
          </span>
        </div>
      </div>
    </footer>
  );
};
