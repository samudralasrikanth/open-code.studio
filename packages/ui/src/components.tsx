import React from "react";

// Button Component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}
export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  style,
  children,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    padding: "6px 12px",
    fontSize: "13px",
    borderRadius: "3px",
    border: "none",
    cursor: props.disabled ? "not-allowed" : "pointer",
    opacity: props.disabled ? 0.6 : 1,
    transition: "background-color 0.2s",
    fontFamily: "system-ui, -apple-system, sans-serif"
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: "#007acc",
      color: "#ffffff"
    },
    secondary: {
      backgroundColor: "#3a3d3e",
      color: "#cccccc"
    },
    danger: {
      backgroundColor: "#f44336",
      color: "#ffffff"
    }
  };

  return (
    <button style={{ ...baseStyle, ...variantStyles[variant], ...style }} {...props}>
      {children}
    </button>
  );
};

// IconButton Component
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  active?: boolean;
}
export const IconButton: React.FC<IconButtonProps> = ({
  title,
  active,
  style,
  children,
  ...props
}) => {
  return (
    <button
      title={title}
      style={{
        background: "none",
        border: "none",
        color: props.disabled ? "#555" : active ? "#fff" : "#aaa",
        cursor: props.disabled ? "not-allowed" : "pointer",
        padding: "4px",
        fontSize: "13px",
        borderRadius: "3px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 0.15s, background-color 0.15s",
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
};

// Panel Component
export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "column";
  backgroundColor?: string;
  borderRight?: string;
  borderLeft?: string;
  borderTop?: string;
  borderBottom?: string;
}
export const Panel: React.FC<PanelProps> = ({
  direction = "column",
  backgroundColor = "#1e1e1e",
  borderRight,
  borderLeft,
  borderTop,
  borderBottom,
  style,
  children,
  ...props
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        backgroundColor,
        borderRight,
        borderLeft,
        borderTop,
        borderBottom,
        boxSizing: "border-box",
        minHeight: 0,
        minWidth: 0,
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Divider Component
export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  color?: string;
  size?: string;
  margin?: string;
}
export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  color = "#2d2d2d",
  size = "1px",
  margin = "0"
}) => {
  const isHorizontal = orientation === "horizontal";
  return (
    <div
      style={{
        width: isHorizontal ? "100%" : size,
        height: isHorizontal ? size : "100%",
        backgroundColor: color,
        margin,
        flexShrink: 0
      }}
    />
  );
};

// Toolbar Component
export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}
export const Toolbar: React.FC<ToolbarProps> = ({ title, style, children, ...props }) => {
  return (
    <div
      style={{
        height: "35px",
        padding: "0 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#252526",
        borderBottom: "1px solid #2d2d2d",
        flexShrink: 0,
        boxSizing: "border-box",
        ...style
      }}
      {...props}
    >
      {title && (
        <span
          style={{
            textTransform: "uppercase",
            fontSize: "11px",
            fontWeight: "bold",
            color: "#858585",
            letterSpacing: "0.05em",
            userSelect: "none"
          }}
        >
          {title}
        </span>
      )}
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>{children}</div>
    </div>
  );
};

// StatusItem Component
export interface StatusItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  value?: string;
}
export const StatusItem: React.FC<StatusItemProps> = ({
  label,
  value,
  style,
  children,
  ...props
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "11px",
        color: "#ffffff",
        cursor: "default",
        userSelect: "none",
        ...style
      }}
      {...props}
    >
      {label && <span style={{ opacity: 0.8 }}>{label}</span>}
      {value && <span style={{ fontWeight: 500 }}>{value}</span>}
      {children}
    </div>
  );
};
