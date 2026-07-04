import React, { useState, useCallback, useEffect, useRef } from "react";

import { useEditor } from "../../hooks/useEditor.js";
import { useWorkspace } from "../../hooks/useWorkspace.js";
import { EditorArea } from "../editor/EditorArea.js";

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
  const { editorState } = useEditor();

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

  const handleOpenFolder = async () => {
    const res = await openFolderDialog();
    if (!res.canceled && res.folderPath) {
      await open(res.folderPath);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Toggle Sidebar: Ctrl+B or Cmd+B
      if (modifier && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarVisible((prev) => !prev);
      }

      // Open Folder: Ctrl+O or Cmd+O
      if (modifier && e.key.toLowerCase() === "o" && !e.shiftKey) {
        e.preventDefault();
        void handleOpenFolder();
      }

      // Focus Explorer: Ctrl+Shift+E or Cmd+Shift+E
      if (modifier && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setIsSidebarVisible(true);
        setActiveView("explorer");
      }

      // Save Active Document: Ctrl+S or Cmd+S
      if (modifier && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const activeGroupId = editorState?.activeGroup;
        const activeGroup = editorState?.groups?.find((g) => g.id === activeGroupId);
        const activeInput = activeGroup?.activeInput;
        if (activeInput && window.ocs?.commands?.execute) {
          void window.ocs.commands.execute("document.save", { uri: activeInput });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [workspace, openFolderDialog, open, editorState]);

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
          <BottomPanel height={bottomPanelHeight} isResizing={isResizingBottom} />
        </div>
      </div>

      <StatusBar workspaceName={workspaceName} />
    </div>
  );
};
