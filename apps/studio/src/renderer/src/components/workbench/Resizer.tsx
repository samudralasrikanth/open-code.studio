import React from "react";

interface ResizerProps {
  orientation: "horizontal" | "vertical";
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing: boolean;
}

export const Resizer: React.FC<ResizerProps> = ({ orientation, onMouseDown, isResizing }) => {
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        width: isHorizontal ? "100%" : "4px",
        height: isHorizontal ? "4px" : "100%",
        cursor: isHorizontal ? "row-resize" : "col-resize",
        backgroundColor: isResizing ? "#007acc" : "#1e1e1e",
        transition: "background-color 0.1s",
        zIndex: 10,
        flexShrink: 0
      }}
      onMouseEnter={(e) => {
        if (!isResizing) e.currentTarget.style.backgroundColor = "#2d2d2d";
      }}
      onMouseLeave={(e) => {
        if (!isResizing) e.currentTarget.style.backgroundColor = "#1e1e1e";
      }}
    />
  );
};
