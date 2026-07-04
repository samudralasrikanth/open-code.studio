import React from "react";

import { CommandPalette } from "../components/commands/CommandPalette.js";
import { DeveloperDiagnosticsPanel } from "../components/explorer/DeveloperDiagnosticsPanel.js";
import { ExplorerPanel } from "../components/explorer/ExplorerPanel.js";
import { SourceControlPanel } from "../components/git/SourceControlPanel.js";
import { TerminalPanel } from "../components/terminal/TerminalPanel.js";
import { SearchSidebar } from "../components/search/SearchSidebar.js";
import { SettingsEditor } from "../components/settings/SettingsEditor.js";
import { EditorArea } from "../components/editor/EditorArea.js";

type SidebarTab = "explorer" | "search" | "source-control" | "settings";

export const WorkspaceScreen: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<SidebarTab>("explorer");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1 or Cmd+Shift+P / Ctrl+Shift+P
      if (
        e.key === "F1" ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "p")
      ) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }

      // Cmd+Shift+F / Ctrl+Shift+F
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setActiveTab("search");
      }

      // Cmd+Shift+G / Ctrl+Shift+G
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        setActiveTab("source-control");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
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
      <div
        style={{
          width: "48px",
          backgroundColor: "#333333",
          borderRight: "1px solid #252526",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div
          onClick={() => setActiveTab("explorer")}
          style={{
            padding: "12px",
            textAlign: "center",
            cursor: "pointer",
            borderLeft: activeTab === "explorer" ? "2px solid #007acc" : "2px solid transparent",
            opacity: activeTab === "explorer" ? 1 : 0.6
          }}
        >
          <span title="Explorer" style={{ fontSize: "20px" }}>
            🗂️
          </span>
        </div>
        <div
          onClick={() => setActiveTab("search")}
          style={{
            padding: "12px",
            textAlign: "center",
            cursor: "pointer",
            borderLeft: activeTab === "search" ? "2px solid #007acc" : "2px solid transparent",
            opacity: activeTab === "search" ? 1 : 0.6
          }}
        >
          <span title="Search" style={{ fontSize: "20px" }}>
            🔍
          </span>
        </div>
        <div
          onClick={() => setActiveTab("source-control")}
          style={{
            padding: "12px",
            textAlign: "center",
            cursor: "pointer",
            borderLeft:
              activeTab === "source-control" ? "2px solid #007acc" : "2px solid transparent",
            opacity: activeTab === "source-control" ? 1 : 0.6
          }}
        >
          <span title="Source Control" style={{ fontSize: "20px" }}>
            🔄
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <div
          onClick={() => setActiveTab("settings")}
          style={{
            padding: "12px",
            textAlign: "center",
            cursor: "pointer",
            borderLeft: activeTab === "settings" ? "2px solid #007acc" : "2px solid transparent",
            opacity: activeTab === "settings" ? 1 : 0.6
          }}
        >
          <span title="Settings" style={{ fontSize: "20px" }}>
            ⚙️
          </span>
        </div>
      </div>

      {/* Sidebar - Explorer / Search / Source Control */}
      {activeTab !== "settings" && (
        <div
          style={{
            width: "250px",
            backgroundColor: "#252526",
            borderRight: "1px solid #2d2d2d",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {activeTab === "explorer" && (
            <>
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
              <div
                style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <ExplorerPanel />
                </div>
                <DeveloperDiagnosticsPanel />
              </div>
            </>
          )}
          {activeTab === "source-control" && (
            <div style={{ flex: 1, overflow: "hidden" }}>
              <SourceControlPanel />
            </div>
          )}
          {activeTab === "search" && (
            <>
              <div
                style={{
                  padding: "10px 16px",
                  textTransform: "uppercase",
                  fontSize: "11px",
                  fontWeight: "bold"
                }}
              >
                Search
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <SearchSidebar />
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Editor Area */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#1e1e1e",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden"
          }}
        >
          {activeTab === "settings" ? <SettingsEditor /> : <EditorArea />}
        </div>

        {/* Terminal Area */}
        <div style={{ height: "30%", minHeight: "200px" }}>
          <TerminalPanel />
        </div>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
