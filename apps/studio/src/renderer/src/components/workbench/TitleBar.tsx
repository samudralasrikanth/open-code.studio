import React from "react";

import { useTheme } from "../../theme/ThemeProvider.js";

interface TitleBarProps {
  title?: string;
}

export const TitleBar: React.FC<TitleBarProps> = ({ title }) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = (): void => {
    void setTheme(theme === "dark" ? "light" : "dark");
  };

  const IconBtn = ({
    children,
    title,
    onClick
  }: {
    children: React.ReactNode;
    title?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  }) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "transparent",
        border: "none",
        color: "var(--workbench-text-secondary)",
        cursor: "pointer",
        padding: "4px",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.1s"
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-bg-hover)")}
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  );

  return (
    <header
      style={
        {
          height: "38px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingRight: "var(--spacing-lg)",
          paddingLeft: navigator.userAgent.includes("Mac") ? "72px" : "var(--spacing-lg)",
          backgroundColor: "var(--workbench-titlebar)",
          borderBottom: "1px solid var(--workbench-border)",
          WebkitAppRegion: "drag",
          flexShrink: 0,
          fontFamily: "var(--font-sans)",
          color: "var(--workbench-text)"
        } as React.CSSProperties
      }
    >
      {/* Left: Empty for traffic lights */}
      <div style={{ display: "flex", flex: 1 }}></div>

      {/* Center: Search Icon & Workspace Name */}
      <div
        style={
          {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            WebkitAppRegion: "no-drag",
            pointerEvents: "auto"
          } as React.CSSProperties
        }
      >
        <IconBtn title="Search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.75.75 0 0 1-1.062 1.06l-3.038-3.04zM11.5 7a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z"
            />
          </svg>
        </IconBtn>
        {title && (
          <span style={{ fontSize: "12px", opacity: 0.8, cursor: "default", userSelect: "none" }}>
            {title}
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div
        style={
          {
            display: "flex",
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "2px",
            WebkitAppRegion: "no-drag"
          } as React.CSSProperties
        }
      >
        <IconBtn title={`Switch Theme`} onClick={toggleTheme}>
          {theme === "dark" ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 10a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zm5.657-6.657a1 1 0 0 1 0 1.414l-.707.707a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0zm-8.485 8.485a1 1 0 0 1 0 1.414l-.707.707a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0zM14 8a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1zM4 8a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1zm9.657 5.657a1 1 0 0 1-1.414 0l-.707-.707a1 1 0 1 1 1.414-1.414l.707.707a1 1 0 0 1 0 1.414zM5.172 4.464a1 1 0 0 1-1.414 0l-.707-.707a1 1 0 1 1 1.414-1.414l.707.707a1 1 0 0 1 0 1.414z" />
              <path d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-2 4a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7 1.5a1.5 1.5 0 0 1 3 0c0 .12-.016.236-.045.347A6 6 0 1 0 13.5 11c.71 0 1.344-.33 1.758-.847A7.5 7.5 0 1 1 7 1.5zm0 1.5a6.002 6.002 0 0 0 0 12A6.002 6.002 0 0 0 13 9c-1.398 0-2.61-.806-3.176-1.99a4.502 4.502 0 0 1-2.813-4.004z" />
            </svg>
          )}
        </IconBtn>
        <div
          style={{
            width: "1px",
            height: "16px",
            backgroundColor: "var(--workbench-border)",
            margin: "0 4px"
          }}
        />
        <IconBtn title="Toggle Primary Side Bar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M2 3h12v10H2V3zm11 1v8H5V4h8z" />
          </svg>
        </IconBtn>
        <IconBtn title="Toggle Panel">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2 3h12v10H2V3zm1 1v5h10V4H3zm10 8H3v-2h10v2z"
            />
          </svg>
        </IconBtn>
        <IconBtn title="Toggle Secondary Side Bar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M2 3h12v10H2V3zm1 1v8h8V4H3z" />
          </svg>
        </IconBtn>
        <IconBtn title="Customize Layout">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1 3.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5zM2 4h12v8H2V4z"
            />
          </svg>
        </IconBtn>
      </div>
    </header>
  );
};
