/* eslint-disable */
import React from "react";
import { CloseIcon, FileIcon } from "@ocs/ui";
import { useEditor } from "../../hooks/useEditor.js";

interface EditorInputTabsProps {
  group: any;
}

export const EditorInputTabs: React.FC<EditorInputTabsProps> = ({ group }) => {
  const { open, close } = useEditor();
  // IPC state gives us group.inputs as an array of IDs.
  // We can render tabs for them.
  const activeId = group.activeInput;

  // We don't have full Input object in renderer, just string IDs right now.
  // We can use the URI display name.

  const handleTabClick = (id: string) => {
    void open(id);
  };

  const handleCloseClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    void close(id, group.id);
  };

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "var(--workbench-background)",
        height: "35px",
        overflowX: "auto",
        borderBottom: "1px solid var(--workbench-border)"
      }}
    >
      {group.inputs.map((id: string) => {
        const isActive = id === activeId;
        const isPreview = id === group.previewInput;

        // Naive display name
        const name = id.split("/").pop() || id;

        return (
          <div
            key={id}
            onClick={() => handleTabClick(id)}
            onAuxClick={(e) => {
              if (e.button === 1) handleCloseClick(e, id);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 10px",
              minWidth: "100px",
              maxWidth: "200px",
              backgroundColor: isActive ? "var(--workbench-background)" : "var(--color-bg-hover)",
              color: isActive ? "var(--workbench-text)" : "var(--workbench-text-secondary)",
              borderRight: "1px solid var(--workbench-border)",
              borderTop: isActive ? "2px solid var(--workbench-accent)" : "2px solid transparent",
              cursor: "pointer",
              fontStyle: isPreview ? "italic" : "normal"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginRight: "6px",
                color: isActive ? "var(--workbench-accent)" : "var(--workbench-text-secondary)",
                opacity: isActive ? 1 : 0.7
              }}
            >
              <FileIcon size={14} />
            </div>
            <span
              style={{
                flex: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: "13px",
                fontFamily: "var(--font-sans)"
              }}
            >
              {name}
            </span>
            {/* Dirty indicator placeholder */}
            <div
              className="dirty-dot"
              style={{
                display: "none",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--color-emerald-glow)",
                marginLeft: "4px"
              }}
            />
            <span
              onClick={(e) => handleCloseClick(e, id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
                e.currentTarget.style.color = "var(--workbench-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "inherit";
              }}
              style={{
                marginLeft: "8px",
                cursor: "pointer",
                padding: "2px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isActive ? "var(--workbench-text-secondary)" : "transparent",
                transition: "background-color 0.1s, color 0.1s"
              }}
              title="Close (⌘W)"
            >
              <CloseIcon size={14} />
            </span>
          </div>
        );
      })}
    </div>
  );
};
