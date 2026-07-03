import React from "react";

import { useTheme } from "../../theme/ThemeProvider.js";

interface TitleBarProps {
  workspaceName?: string;
}

export const TitleBar: React.FC<TitleBarProps> = ({ workspaceName }) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = (): void => {
    void setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header
      style={
        {
          height: "38px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          backgroundColor: "#181818",
          borderBottom: "1px solid #2d2d2d",
          WebkitAppRegion: "drag",
          flexShrink: 0
        } as React.CSSProperties
      }
    >
      <div
        style={
          {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            WebkitAppRegion: "no-drag"
          } as React.CSSProperties
        }
      >
        <span style={{ fontSize: "14px", fontWeight: 600 }}>Open-Code.Studio</span>
        {workspaceName && (
          <span style={{ fontSize: "12px", color: "#888", marginLeft: "8px" }}>
            — {workspaceName}
          </span>
        )}
      </div>
      <div
        style={
          {
            display: "flex",
            alignItems: "center",
            gap: "4px",
            WebkitAppRegion: "no-drag"
          } as React.CSSProperties
        }
      >
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
            fontSize: "14px",
            borderRadius: "4px",
            color: "#ccc"
          }}
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
        <button
          type="button"
          title="Settings (coming soon)"
          disabled
          style={{
            background: "none",
            border: "none",
            cursor: "default",
            padding: "4px 8px",
            fontSize: "12px",
            borderRadius: "4px",
            color: "#666"
          }}
        >
          Settings
        </button>
      </div>
    </header>
  );
};
