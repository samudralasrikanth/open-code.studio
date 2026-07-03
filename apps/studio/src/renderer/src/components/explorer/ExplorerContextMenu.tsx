import React, { useEffect, useRef } from "react";

export interface ContextMenuItem {
  label: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}

interface ExplorerContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ExplorerContextMenu: React.FC<ExplorerContextMenuProps> = ({
  x,
  y,
  items,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: y,
        left: x,
        zIndex: 10000,
        backgroundColor: "#252526",
        border: "1px solid #454545",
        borderRadius: "4px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        minWidth: "180px",
        padding: "4px 0",
        fontSize: "13px"
      }}
    >
      {items.map((item, index) =>
        item.separator ? (
          <div
            key={`sep-${index}`}
            style={{ height: "1px", backgroundColor: "#454545", margin: "4px 0" }}
          />
        ) : (
          <button
            key={item.label}
            type="button"
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled) {
                item.action();
                onClose();
              }
            }}
            style={{
              display: "block",
              width: "100%",
              padding: "6px 20px",
              textAlign: "left",
              background: "none",
              border: "none",
              color: item.disabled ? "#666" : "#ccc",
              cursor: item.disabled ? "default" : "pointer",
              fontSize: "13px"
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) e.currentTarget.style.backgroundColor = "#094771";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
};
