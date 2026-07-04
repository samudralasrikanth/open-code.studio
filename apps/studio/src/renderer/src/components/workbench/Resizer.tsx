import React, { useEffect, useRef, useState } from "react";

interface ResizerProps {
  orientation: "horizontal" | "vertical";
  onResize: (delta: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

export const Resizer: React.FC<ResizerProps> = ({
  orientation,
  onResize,
  onResizeStart,
  onResizeEnd
}) => {
  const isHorizontal = orientation === "horizontal";
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const startPosRef = useRef<number>(0);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const currentPos = isHorizontal ? e.clientY : e.clientX;
      const delta = currentPos - startPosRef.current;
      startPosRef.current = currentPos;
      onResize(delta);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      onResizeEnd?.();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, isHorizontal, onResize, onResizeEnd]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startPosRef.current = isHorizontal ? e.clientY : e.clientX;
    setIsResizing(true);
    onResizeStart?.();
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: isHorizontal ? "100%" : "4px",
        height: isHorizontal ? "4px" : "100%",
        cursor: isHorizontal ? "row-resize" : "col-resize",
        backgroundColor: isResizing
          ? "var(--workbench-accent)"
          : isHovered
            ? "var(--workbench-border-strong)"
            : "transparent",
        transition: "background-color 0.1s",
        zIndex: 10,
        flexShrink: 0
      }}
    />
  );
};
