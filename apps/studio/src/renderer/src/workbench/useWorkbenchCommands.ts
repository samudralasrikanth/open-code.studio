import { useEffect } from "react";

import {
  registerRendererCommand,
  unregisterRendererCommand
} from "../commands/RendererCommandRegistry.js";

import type { UseWorkbenchLayoutReturn } from "./useWorkbenchLayout.js";

interface UseWorkbenchCommandsProps {
  layoutManager: UseWorkbenchLayoutReturn;
  openFolderDialog: () => Promise<void>;
  setIsCommandPaletteOpen: (open: boolean) => void;
  setIsQuickOpenOpen: (open: boolean) => void;
}

export function useWorkbenchCommands({
  layoutManager,
  openFolderDialog,
  setIsCommandPaletteOpen,
  setIsQuickOpenOpen
}: UseWorkbenchCommandsProps): void {
  useEffect(() => {
    registerRendererCommand({
      id: "workbench.action.showCommands",
      title: "Show Command Palette",
      category: "View",
      execute: () => setIsCommandPaletteOpen(true)
    });
    registerRendererCommand({
      id: "workbench.action.quickOpen",
      title: "Go to File...",
      category: "File",
      execute: () => setIsQuickOpenOpen(true)
    });
    registerRendererCommand({
      id: "workbench.action.toggleSidebar",
      title: "Toggle Primary Sidebar",
      category: "View",
      execute: () => layoutManager.toggleRegion("primarySidebar")
    });
    registerRendererCommand({
      id: "workbench.action.toggleSecondarySidebar",
      title: "Toggle Secondary Sidebar",
      category: "View",
      execute: () => layoutManager.toggleRegion("secondarySidebar")
    });
    registerRendererCommand({
      id: "workbench.action.toggleBottomPanel",
      title: "Toggle Bottom Panel",
      category: "View",
      execute: () => layoutManager.toggleRegion("bottomPanel")
    });
    registerRendererCommand({
      id: "workbench.action.maximizeBottomPanel",
      title: "Maximize Bottom Panel",
      category: "View",
      execute: () => {
        const currentHeight = layoutManager.layout.bottomPanel.height || 220;
        layoutManager.setRegionSize("bottomPanel", currentHeight >= 360 ? 220 : 420);
      }
    });
    registerRendererCommand({
      id: "workbench.action.openFolder",
      title: "Open Folder...",
      category: "File",
      execute: () => openFolderDialog()
    });
    registerRendererCommand({
      id: "workbench.action.showExplorer",
      title: "Explorer: Focus on Explorer View",
      category: "View",
      execute: () => layoutManager.setActivePanel("primarySidebar", "explorer")
    });
    registerRendererCommand({
      id: "workbench.action.showSearch",
      title: "Search: Find in Files",
      category: "View",
      execute: () => layoutManager.setActivePanel("primarySidebar", "search")
    });
    registerRendererCommand({
      id: "workbench.action.showSourceControl",
      title: "Source Control",
      category: "View",
      execute: () => layoutManager.setActivePanel("primarySidebar", "source-control")
    });
    registerRendererCommand({
      id: "workbench.action.toggleTerminal",
      title: "Terminal: Toggle Terminal",
      category: "View",
      execute: () => layoutManager.setActivePanel("bottomPanel", "terminal")
    });

    return () => {
      unregisterRendererCommand("workbench.action.showCommands");
      unregisterRendererCommand("workbench.action.quickOpen");
      unregisterRendererCommand("workbench.action.toggleSidebar");
      unregisterRendererCommand("workbench.action.toggleSecondarySidebar");
      unregisterRendererCommand("workbench.action.toggleBottomPanel");
      unregisterRendererCommand("workbench.action.maximizeBottomPanel");
      unregisterRendererCommand("workbench.action.openFolder");
      unregisterRendererCommand("workbench.action.showExplorer");
      unregisterRendererCommand("workbench.action.showSearch");
      unregisterRendererCommand("workbench.action.showSourceControl");
      unregisterRendererCommand("workbench.action.toggleTerminal");
    };
  }, [layoutManager, openFolderDialog, setIsCommandPaletteOpen, setIsQuickOpenOpen]);
}
