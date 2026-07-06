import {
  FolderIcon,
  SearchIcon,
  SourceControlIcon,
  TerminalIcon,
  DiagnosticsIcon,
  ProblemsIcon,
  OutputIcon,
  RunDebugIcon,
  ExtensionsIcon
} from "@ocs/ui";
import React from "react";

import { DeveloperDiagnosticsPanel } from "../../components/explorer/DeveloperDiagnosticsPanel.js";
import { ExtensionsPanel } from "../../components/extensions/ExtensionsPanel.js";
import { SourceControlPanel } from "../../components/git/SourceControlPanel.js";
import { SearchSidebar } from "../../components/search/SearchSidebar.js";
import type { PanelRegistryImpl } from "../PanelRegistry.js";
import { ExplorerPanelWrapper } from "./ExplorerPanelWrapper.js";
import { TerminalPanelWrapper } from "./TerminalPanelWrapper.js";

const ProblemsPlaceholder: React.FC = () => (
  <div style={{ padding: "16px", color: "var(--workbench-text-muted)" }}>
    No problems have been detected in the workspace.
  </div>
);

const OutputPlaceholder: React.FC = () => (
  <div style={{ padding: "16px", color: "var(--workbench-text-muted)" }}>
    Output channel (coming soon)
  </div>
);

const DebugPlaceholder: React.FC = () => (
  <div style={{ padding: "16px", color: "var(--workbench-text-muted)" }}>
    Run and Debug (coming soon)
  </div>
);

export function registerBuiltinPanels(registry: PanelRegistryImpl): void {
  registry.register({
    id: "explorer",
    title: "Explorer",
    icon: <FolderIcon size={24} />,
    component: ExplorerPanelWrapper,
    defaultPosition: "primary-sidebar",
    allowedPositions: ["primary-sidebar"],
    order: 10
  });

  registry.register({
    id: "search",
    title: "Search",
    icon: <SearchIcon size={24} />,
    component: SearchSidebar,
    defaultPosition: "primary-sidebar",
    allowedPositions: ["primary-sidebar", "secondary-sidebar"],
    order: 20
  });

  registry.register({
    id: "source-control",
    title: "Source Control",
    icon: <SourceControlIcon size={24} />,
    component: SourceControlPanel,
    defaultPosition: "primary-sidebar",
    allowedPositions: ["primary-sidebar"],
    order: 30
  });

  registry.register({
    id: "run-debug",
    title: "Run and Debug",
    icon: <RunDebugIcon size={24} />,
    component: DebugPlaceholder,
    defaultPosition: "primary-sidebar",
    allowedPositions: ["primary-sidebar"],
    order: 40
  });

  registry.register({
    id: "extensions",
    title: "Extensions",
    icon: <ExtensionsIcon size={24} />,
    component: ExtensionsPanel,
    defaultPosition: "primary-sidebar",
    allowedPositions: ["primary-sidebar"],
    order: 50
  });

  registry.register({
    id: "terminal",
    title: "Terminal",
    icon: <TerminalIcon size={12} />,
    component: TerminalPanelWrapper,
    defaultPosition: "bottom",
    allowedPositions: ["bottom"],
    order: 30
  });

  registry.register({
    id: "diagnostics",
    title: "Diagnostics",
    icon: <DiagnosticsIcon size={12} />,
    component: DeveloperDiagnosticsPanel,
    defaultPosition: "bottom",
    allowedPositions: ["bottom"],
    order: 40
  });

  registry.register({
    id: "problems",
    title: "Problems",
    icon: <ProblemsIcon size={12} />,
    component: ProblemsPlaceholder,
    defaultPosition: "bottom",
    allowedPositions: ["bottom"],
    order: 10
  });

  registry.register({
    id: "output",
    title: "Output",
    icon: <OutputIcon size={12} />,
    component: OutputPlaceholder,
    defaultPosition: "bottom",
    allowedPositions: ["bottom"],
    order: 20
  });
}
