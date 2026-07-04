import React, { useEffect, useRef } from "react";

export interface ContextMenuItem {
  label: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
  checked?: boolean;
}

interface ExplorerContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const CheckIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{ marginRight: "6px" }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.431 3.323l-8.47 10-.79-.036-3.35-4.77.818-.574 2.978 4.24 8.051-9.506.763.646z"
    />
  </svg>
);

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
              display: "flex",
              alignItems: "center",
              width: "100%",
              padding: "6px 12px 6px 20px",
              textAlign: "left",
              background: "none",
              border: "none",
              color: item.disabled ? "#666" : "#ccc",
              cursor: item.disabled ? "default" : "pointer",
              fontSize: "13px",
              position: "relative"
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) e.currentTarget.style.backgroundColor = "#094771";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <span
              style={{ position: "absolute", left: "6px", display: "flex", alignItems: "center" }}
            >
              {item.checked && <CheckIcon size={12} />}
            </span>
            <span style={{ marginLeft: "12px" }}>{item.label}</span>
          </button>
        )
      )}
    </div>
  );
};
