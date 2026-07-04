/**
 * ExplorerPanelWrapper.tsx — Self-contained Explorer panel.
 *
 * Wraps ExplorerPanel + its Toolbar into a single component that can be
 * rendered by the panel system without depending on a Sidebar parent.
 */

import { Toolbar, IconButton } from "@ocs/ui";
import React, { useState, useRef } from "react";

import {
  ExplorerContextMenu,
  type ContextMenuItem
} from "../../components/explorer/ExplorerContextMenu.js";
import { ExplorerPanel } from "../../components/explorer/ExplorerPanel.js";

import { NpmScriptsPanel } from "./NpmScriptsPanel.js";
import { OutlinePanel } from "./OutlinePanel.js";
import { TimelinePanel } from "./TimelinePanel.js";

export const ExplorerPanelWrapper: React.FC = () => {
  const [menuCoords, setMenuCoords] = useState<{ x: number; y: number } | null>(null);
  const [features, setFeatures] = useState({
    folders: true,
    outline: true,
    timeline: true,
    npmScripts: true
  });

  const buttonRef = useRef<HTMLDivElement>(null);

  const handleMenuClick = (e: React.MouseEvent) => {
    if (menuCoords) {
      setMenuCoords(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuCoords({ x: rect.right - 180, y: rect.bottom + 4 });
    }
  };

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuItems: ContextMenuItem[] = [
    { label: "Open Editors", action: () => {}, disabled: true },
    { label: "", action: () => {}, separator: true },
    { label: "Folders", action: () => toggleFeature("folders"), checked: features.folders },
    { label: "Outline", action: () => toggleFeature("outline"), checked: features.outline },
    { label: "Timeline", action: () => toggleFeature("timeline"), checked: features.timeline },
    {
      label: "NPM Scripts",
      action: () => toggleFeature("npmScripts"),
      checked: features.npmScripts
    }
  ];

  const PanelAccordion: React.FC<{
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
  }> = ({ title, children, defaultExpanded = true }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none",
            padding: "0 4px 0 2px",
            fontWeight: "bold",
            textTransform: "uppercase",
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.05em",
            height: "26px",
            backgroundColor: isHovered ? "rgba(255, 255, 255, 0.05)" : "transparent",
            color: "var(--workbench-text-secondary)",
            borderTop: "1px solid transparent"
          }}
        >
          <span
            style={{
              transform: isExpanded ? "rotate(90deg)" : "none",
              transition: "transform 0.1s",
              display: "inline-flex",
              width: "20px",
              justifyContent: "center",
              color: "inherit"
            }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.2 3.5l4.8 4.5-4.8 4.5h1.6l4.8-4.5-4.8-4.5H4.2z"
              />
            </svg>
          </span>
          <span
            style={{ flex: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
          >
            {title}
          </span>
        </div>
        {isExpanded && (
          <div
            style={{
              padding: "8px 20px",
              color: "var(--workbench-text-muted)",
              fontSize: "12px",
              backgroundColor: "transparent"
            }}
          >
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <Toolbar title="Explorer">
        <div ref={buttonRef}>
          <IconButton title="Views and More Actions" onClick={handleMenuClick}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
            </svg>
          </IconButton>
        </div>
      </Toolbar>

      {menuCoords && (
        <ExplorerContextMenu
          x={menuCoords.x}
          y={menuCoords.y}
          items={menuItems}
          onClose={() => setMenuCoords(null)}
        />
      )}

      {features.folders && (
        <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
          <ExplorerPanel />
        </div>
      )}

      {features.outline && (
        <PanelAccordion title="Outline" defaultExpanded={false}>
          <OutlinePanel />
        </PanelAccordion>
      )}

      {features.timeline && (
        <PanelAccordion title="Timeline" defaultExpanded={false}>
          <TimelinePanel />
        </PanelAccordion>
      )}

      {features.npmScripts && (
        <PanelAccordion title="NPM Scripts" defaultExpanded={false}>
          <NpmScriptsPanel
            onRunScript={(scriptName) => {
              void (async () => {
                try {
                  const ws = (await window.ocs?.workspace?.getActive()) as { uri?: string } | null;
                  if (ws?.uri && window.ocs?.terminal?.create) {
                    const pathStr = ws.uri.startsWith("file://")
                      ? ws.uri.replace("file://", "")
                      : ws.uri;
                    const session = (await window.ocs.terminal.create({ cwd: pathStr })) as {
                      id: string;
                    };
                    await window.ocs.terminal.sendText(session.id, `npm run ${scriptName}\r`);
                  }
                } catch (e) {
                  console.error("Failed to run npm script", e);
                }
              })();
            }}
          />
        </PanelAccordion>
      )}
    </div>
  );
};
