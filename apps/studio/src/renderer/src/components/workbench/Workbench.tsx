import React, { useState, useEffect } from "react";

import { useKeybindings } from "../../hooks/useKeybindings.js";
import { useWorkspace } from "../../hooks/useWorkspace.js";
import { PanelRegistryProvider } from "../../workbench/PanelRegistry.js";
import { registerBuiltinPanels } from "../../workbench/panels/index.js";
import { useWorkbenchCommands } from "../../workbench/useWorkbenchCommands.js";
import { useWorkbenchLayout } from "../../workbench/useWorkbenchLayout.js";
import { WorkbenchRegion } from "../../workbench/WorkbenchRegion.js";
import { CommandPalette } from "../commands/CommandPalette.js";
import { QuickOpen } from "../commands/QuickOpen.js";
import { EditorArea } from "../editor/EditorArea.js";

import { ActivityBar } from "./ActivityBar.js";
import { Resizer } from "./Resizer.js";
import { StatusBar } from "./StatusBar.js";
import { TitleBar } from "./TitleBar.js";

interface WorkbenchProps {
  workspaceName?: string;
}

const WorkbenchShell: React.FC<WorkbenchProps> = ({ workspaceName }) => {
  const { openFolderDialog } = useWorkspace();
  const layoutManager = useWorkbenchLayout();
  const { layout, resizingRegion, setResizingRegion } = layoutManager;
  useKeybindings();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickOpenOpen, setIsQuickOpenOpen] = useState(false);

  useWorkbenchCommands({
    layoutManager,
    openFolderDialog: async () => {
      await openFolderDialog();
    },
    setIsCommandPaletteOpen,
    setIsQuickOpenOpen
  });

  // Persist layout to settings when it changes, debounce to avoid thrashing
  useEffect(() => {
    const timer = setTimeout(() => {
      void layoutManager.saveLayout();
    }, 1000);
    return () => clearTimeout(timer);
  }, [layoutManager.layout]);

  return (
    <div
      className="workbench-wrapper"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        backgroundColor: "var(--workbench-background)",
        color: "var(--workbench-text)",
        overflow: "hidden"
      }}
    >
      <TitleBar title={workspaceName || ""} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {layout.activityBar.visible && layout.activityBar.position === "left" && (
          <ActivityBar
            activePanelId={layout.primarySidebar.activePanelId}
            onPanelSelect={(id) => layoutManager.setActivePanel("primarySidebar", id)}
          />
        )}

        {layout.primarySidebar.visible && (
          <WorkbenchRegion
            region={layout.primarySidebar}
            position="primary-sidebar"
            orientation="vertical"
            onActivePanelChange={(id) => layoutManager.setActivePanel("primarySidebar", id)}
            isResizing={resizingRegion === "primarySidebar"}
            hideTabs={true}
          />
        )}

        {layout.primarySidebar.visible && (
          <Resizer
            orientation="vertical"
            onResizeStart={() => setResizingRegion("primarySidebar")}
            onResize={(delta) =>
              layoutManager.setRegionSize(
                "primarySidebar",
                (layout.primarySidebar.width || 280) + delta
              )
            }
            onResizeEnd={() => setResizingRegion(null)}
          />
        )}

        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}
        >
          <EditorArea />

          {layout.bottomPanel.visible && (
            <Resizer
              orientation="horizontal"
              onResizeStart={() => setResizingRegion("bottomPanel")}
              onResize={(delta) =>
                layoutManager.setRegionSize(
                  "bottomPanel",
                  (layout.bottomPanel.height || 220) - delta
                )
              }
              onResizeEnd={() => setResizingRegion(null)}
            />
          )}

          {layout.bottomPanel.visible && (
            <WorkbenchRegion
              region={layout.bottomPanel}
              position="bottom"
              orientation="horizontal"
              onActivePanelChange={(id) => layoutManager.setActivePanel("bottomPanel", id)}
              isResizing={resizingRegion === "bottomPanel"}
            />
          )}
        </div>

        {layout.secondarySidebar.visible && (
          <Resizer
            orientation="vertical"
            onResizeStart={() => setResizingRegion("secondarySidebar")}
            onResize={(delta) =>
              layoutManager.setRegionSize(
                "secondarySidebar",
                (layout.secondarySidebar.width || 360) - delta
              )
            }
            onResizeEnd={() => setResizingRegion(null)}
          />
        )}

        {layout.secondarySidebar.visible && (
          <WorkbenchRegion
            region={layout.secondarySidebar}
            position="secondary-sidebar"
            orientation="vertical"
            onActivePanelChange={(id) => layoutManager.setActivePanel("secondarySidebar", id)}
            isResizing={resizingRegion === "secondarySidebar"}
          />
        )}
      </div>

      <StatusBar />
      {isCommandPaletteOpen && (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
        />
      )}
      {isQuickOpenOpen && (
        <QuickOpen isOpen={isQuickOpenOpen} onClose={() => setIsQuickOpenOpen(false)} />
      )}
    </div>
  );
};

export const Workbench: React.FC<WorkbenchProps> = (props) => {
  return (
    <PanelRegistryProvider onReady={registerBuiltinPanels}>
      <WorkbenchShell {...props} />
    </PanelRegistryProvider>
  );
};
