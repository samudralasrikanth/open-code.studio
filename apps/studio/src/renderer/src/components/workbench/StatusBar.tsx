import { StatusItem } from "@ocs/ui";
import React from "react";

import { useExplorer } from "../../hooks/useExplorer.js";

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
        flexShrink: 0,
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
    >
      <div style={{ display: "flex", gap: "16px" }}>
        <StatusItem value="Ready" />
        {workspaceName && <StatusItem label="Workspace:" value={workspaceName} />}
        <StatusItem label="Explorer:" value={explorerReady ? "Healthy" : "Idle"} />
        <StatusItem value={`${fileCount.toLocaleString()} Files`} />
      </div>
      <div style={{ display: "flex", gap: "16px" }}>
        {selectedFile && (
          <>
            <StatusItem value="Ln 1, Col 1" />
            <StatusItem value="Spaces: 2" />
            <StatusItem value="UTF-8" />
            <StatusItem value="LF" />
            <StatusItem value={language} />
          </>
        )}
        <StatusItem value="Git: main" />
      </div>
    </footer>
  );
};
