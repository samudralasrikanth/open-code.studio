import {
  ChevronDownIcon,
  CloseIcon,
  MaximizeIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SplitHorizontalIcon,
  TerminalIcon,
  TrashIcon,
  WarningIcon
} from "@ocs/ui";
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
          backgroundColor: "var(--workbench-background)",
          padding: "0 12px 0 16px",
          height: "35px",
          borderTop: "1px solid var(--workbench-border)",
          borderBottom: "1px solid var(--workbench-border)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", height: "100%" }}>
          <span
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "var(--workbench-text-muted)",
              letterSpacing: "0.05em"
            }}
          >
            Terminal
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {/* Shell Selector */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              color: "var(--workbench-text-secondary)",
              padding: "4px 8px",
              cursor: "pointer",
              borderRadius: "4px",
              fontSize: "12px",
              fontFamily: "var(--font-mono)"
            }}
            className="hover:bg-[var(--color-bg-hover)] hover:text-[var(--workbench-text)]"
          >
            <span>{`>_ zsh`}</span>
            <ChevronDownIcon size={12} />
          </button>

          <div
            style={{
              width: "1px",
              height: "14px",
              backgroundColor: "var(--workbench-border)",
              margin: "0 4px"
            }}
          />

          {/* Actions */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              background: "none",
              border: "none",
              color: "var(--workbench-text-secondary)",
              padding: "4px",
              cursor: "pointer",
              borderRadius: "4px"
            }}
            className="hover:bg-[var(--color-bg-hover)] hover:text-[var(--workbench-text)]"
            title="New Terminal"
          >
            <PlusIcon size={14} />
            <ChevronDownIcon size={12} />
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              color: "var(--workbench-text-secondary)",
              width: "24px",
              height: "24px",
              cursor: "pointer",
              borderRadius: "4px"
            }}
            className="hover:bg-[var(--color-bg-hover)] hover:text-[var(--workbench-text)]"
            title="Split Terminal"
          >
            <SplitHorizontalIcon size={14} />
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              color: "var(--workbench-text-secondary)",
              width: "24px",
              height: "24px",
              cursor: "pointer",
              borderRadius: "4px"
            }}
            className="hover:bg-[var(--color-bg-hover)] hover:text-[var(--workbench-text)]"
            title="Kill Terminal"
          >
            <TrashIcon size={14} />
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              color: "var(--workbench-text-secondary)",
              width: "24px",
              height: "24px",
              cursor: "pointer",
              borderRadius: "4px"
            }}
            className="hover:bg-[var(--color-bg-hover)] hover:text-[var(--workbench-text)]"
            title="More Actions..."
          >
            <MoreHorizontalIcon size={14} />
          </button>

          <div
            style={{
              width: "1px",
              height: "14px",
              backgroundColor: "var(--workbench-border)",
              margin: "0 4px"
            }}
          />

          <button
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              color: "var(--workbench-text-secondary)",
              width: "24px",
              height: "24px",
              cursor: "pointer",
              borderRadius: "4px"
            }}
            className="hover:bg-[var(--color-bg-hover)] hover:text-[var(--workbench-text)]"
            title="Maximize Panel"
          >
            <MaximizeIcon size={14} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              color: "var(--workbench-text-secondary)",
              width: "24px",
              height: "24px",
              cursor: "pointer",
              borderRadius: "4px"
            }}
            className="hover:bg-[var(--color-bg-hover)] hover:text-[var(--workbench-text)]"
            title="Close Panel"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Content Area with Right Sidebar */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Main Terminal View */}
        <div style={{ flex: 1, padding: "8px", overflow: "hidden" }}>
          <TerminalView cwd={cwd} />
        </div>

        {/* Terminal Sessions Sidebar */}
        <div
          style={{
            width: "48px",
            borderLeft: "1px solid var(--workbench-border)",
            backgroundColor: "var(--workbench-background)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "8px",
            gap: "8px"
          }}
        >
          {/* Active Terminal Tab */}
          <div
            style={{
              position: "relative",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              backgroundColor: "var(--color-bg-active)",
              color: "var(--workbench-text)",
              cursor: "pointer"
            }}
          >
            <TerminalIcon size={16} />
            {/* Active Indicator Line */}
            <div
              style={{
                position: "absolute",
                left: "-8px",
                top: "20%",
                height: "60%",
                width: "2px",
                backgroundColor: "var(--workbench-accent)",
                borderRadius: "0 2px 2px 0"
              }}
            />
          </div>

          {/* Example inactive terminal tab with warning */}
          <div
            style={{
              position: "relative",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              color: "var(--workbench-text-secondary)",
              cursor: "pointer"
            }}
            className="hover:bg-[var(--color-bg-hover)]"
          >
            <TerminalIcon size={16} />
            <WarningIcon
              size={10}
              style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                color: "var(--color-warning)"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
