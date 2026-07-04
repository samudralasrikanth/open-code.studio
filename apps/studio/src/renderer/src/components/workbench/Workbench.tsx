import React, { useState, useCallback, useEffect, useRef } from "react";

import { useWorkspace } from "../../hooks/useWorkspace.js";
import { useKeybindings } from "../../hooks/useKeybindings.js";
import { EditorArea } from "../editor/EditorArea.js";
import { CommandPalette } from "../commands/CommandPalette.js";
import {
  registerRendererCommand,
  unregisterRendererCommand
} from "../../commands/RendererCommandRegistry.js";
import { ActivityBar } from "./ActivityBar.js";
import { BottomPanel } from "./BottomPanel.js";
import { Resizer } from "./Resizer.js";
import { Sidebar } from "./Sidebar.js";
import { StatusBar } from "./StatusBar.js";
import { TitleBar } from "./TitleBar.js";

interface WorkbenchProps {
  workspaceName?: string;
}

export const Workbench: React.FC<WorkbenchProps> = ({ workspaceName }) => {
  const { workspace, updateSettings, openFolderDialog, open } = useWorkspace();
  useKeybindings();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<"problems" | "output" | "terminal" | "diagnostics">(
    "terminal"
  );

  // Read width from settings or default to 280
  const settingsSidebarWidth = workspace?.configuration?.settings?.["sidebarWidth"] as
    number | undefined;
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(220);

  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingBottom, setIsResizingBottom] = useState(false);
  const [activeView, setActiveView] = useState("explorer");

  // Keep a ref to sidebarWidth for the drag-end closure
  const sidebarWidthRef = useRef(sidebarWidth);
  useEffect(() => {
    sidebarWidthRef.current = sidebarWidth;
  }, [sidebarWidth]);

  // Sync saved width when workspace loads
  useEffect(() => {
    if (settingsSidebarWidth) {
      setSidebarWidth(settingsSidebarWidth);
    }
  }, [settingsSidebarWidth]);

  // Sidebar drag resize
  const handleSidebarMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizingSidebar(true);
      const startX = e.clientX;
      const startWidth = sidebarWidthRef.current;

      const doDrag = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const newWidth = Math.max(180, Math.min(600, startWidth + deltaX));
        setSidebarWidth(newWidth);
      };

      const stopDrag = () => {
        setIsResizingSidebar(false);
        document.removeEventListener("mousemove", doDrag);
        document.removeEventListener("mouseup", stopDrag);
        // Persist on drag end
        void updateSettings({ sidebarWidth: sidebarWidthRef.current });
      };

      document.addEventListener("mousemove", doDrag);
      document.addEventListener("mouseup", stopDrag);
    },
    [updateSettings]
  );

  // Bottom panel drag resize
  const handleBottomMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizingBottom(true);
      const startY = e.clientY;
      const startHeight = bottomPanelHeight;

      const doDrag = (moveEvent: MouseEvent) => {
        const deltaY = moveEvent.clientY - startY;
        const newHeight = Math.max(100, Math.min(600, startHeight - deltaY));
        setBottomPanelHeight(newHeight);
      };

      const stopDrag = () => {
        setIsResizingBottom(false);
        document.removeEventListener("mousemove", doDrag);
        document.removeEventListener("mouseup", stopDrag);
      };

      document.addEventListener("mousemove", doDrag);
      document.addEventListener("mouseup", stopDrag);
    },
    [bottomPanelHeight]
  );

  useEffect(() => {
    const localCommands = [
      {
        id: "workbench.action.showCommands",
        title: "Show All Commands",
        category: "Workbench",
        execute: async () => {
          setIsCommandPaletteOpen(true);
        }
      },
      {
        id: "workbench.action.toggleSidebar",
        title: "View: Toggle Sidebar",
        category: "Workbench",
        execute: async () => {
          setIsSidebarVisible((prev) => !prev);
        }
      },
      {
        id: "workbench.action.openFolder",
        title: "File: Open Folder...",
        category: "File",
        execute: async () => {
          const { canceled, folderPath } = await openFolderDialog();
          if (!canceled && folderPath) {
            await open(folderPath);
          }
        }
      },
      {
        id: "workbench.action.showExplorer",
        title: "View: Show Explorer",
        category: "View",
        execute: async () => {
          setIsSidebarVisible(true);
          setActiveView("explorer");
        }
      },
      {
        id: "workbench.action.showSearch",
        title: "View: Show Search",
        category: "View",
        execute: async () => {
          setIsSidebarVisible(true);
          setActiveView("search");
        }
      },
      {
        id: "workbench.action.openSettings",
        title: "Preferences: Open Settings",
        category: "Workbench",
        execute: async () => {
          setIsSidebarVisible(true);
          setActiveView("settings");
        }
      },
      {
        id: "workbench.action.toggleTerminal",
        title: "View: Toggle Terminal",
        category: "View",
        execute: async () => {
          setActiveBottomTab("terminal");
        }
      }
    ];

    localCommands.forEach(registerRendererCommand);
    return () => {
      localCommands.forEach((command) => unregisterRendererCommand(command.id));
    };
  }, [open, openFolderDialog]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#1e1e1e",
        color: "#ccc",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
    >
      <TitleBar workspaceName={workspaceName} />

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Activity Bar */}
        <ActivityBar activeView={activeView} onViewChange={setActiveView} />

        {/* Sidebar */}
        {isSidebarVisible &&
          (activeView === "explorer" ||
            activeView === "source-control" ||
            activeView === "search") && (
            <>
              <Sidebar
                width={sidebarWidth}
                isResizing={isResizingSidebar}
                activeView={activeView}
              />
              <Resizer
                orientation="vertical"
                onMouseDown={handleSidebarMouseDown}
                isResizing={isResizingSidebar}
              />
            </>
          )}

        {/* Editor Area & Bottom panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Main Area */}
          <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
            <EditorArea />
          </div>

          {/* Bottom Resizer */}
          <Resizer
            orientation="horizontal"
            onMouseDown={handleBottomMouseDown}
            isResizing={isResizingBottom}
          />

          {/* Bottom panel */}
          <BottomPanel
            height={bottomPanelHeight}
            isResizing={isResizingBottom}
            activeTab={activeBottomTab}
            onTabChange={setActiveBottomTab}
          />
        </div>
      </div>

      <StatusBar workspaceName={workspaceName} />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
