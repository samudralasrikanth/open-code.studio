/* eslint-disable */
import { uriDisplayName } from "@ocs/workspace";
import React from "react";

interface EditorInputTabsProps {
  group: any;
}

export const EditorInputTabs: React.FC<EditorInputTabsProps> = ({ group }) => {
  // IPC state gives us group.inputs as an array of IDs.
  // We can render tabs for them.
  const activeId = group.activeInput;

  // We don't have full Input object in renderer, just string IDs right now.
  // We can use the URI display name.

  const handleTabClick = (id: string) => {
    window.ocs.editor.open(id);
  };

  const handleCloseClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    window.ocs.editor.close(id, group.id);
  };

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#252526",
        height: "35px",
        overflowX: "auto",
        borderBottom: "1px solid #1e1e1e"
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
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 10px",
              minWidth: "100px",
              maxWidth: "200px",
              backgroundColor: isActive ? "#1e1e1e" : "#2d2d2d",
              color: isActive ? "#fff" : "#999",
              borderRight: "1px solid #1e1e1e",
              borderTop: isActive ? "1px solid #007acc" : "1px solid transparent",
              cursor: "pointer",
              fontStyle: isPreview ? "italic" : "normal"
            }}
          >
            <span
              style={{
                flex: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: "13px"
              }}
            >
              {name}
            </span>
            <span
              onClick={(e) => handleCloseClick(e, id)}
              style={{
                marginLeft: "8px",
                cursor: "pointer",
                padding: "2px",
                borderRadius: "3px"
              }}
              title="Close (⌘W)"
            >
              ✕
            </span>
          </div>
        );
      })}
    </div>
  );
};
