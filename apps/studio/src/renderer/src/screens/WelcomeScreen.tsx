/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider.js";
import styles from "./WelcomeScreen.module.css";

interface PlatformInfo {
  appVersion: string;
  platform: string;
}

export function WelcomeScreen(): React.ReactElement {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [platform, setPlatform] = useState<PlatformInfo | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [recent, setRecent] = useState<readonly import("@ocs/workspace").RecentWorkspace[]>([]);

  useEffect(() => {
    window.ocs?.health
      .platformInfo()
      .then((info) => {
        setPlatform({ appVersion: info.appVersion, platform: info.platform });
      })
      .catch(() => {
        setPlatform({ appVersion: "0.1.0", platform: process.platform });
      });

    window.ocs?.workspace
      .getRecent()
      .then((workspaces) => {
        setRecent(workspaces);
      })
      .catch(console.error);

    // Small delay so the startup animation is visible
    const timer = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const openWorkspace = async (path: string): Promise<void> => {
    const workspace = await window.ocs?.workspace.open(path);
    if (workspace) {
      navigate(`/workspace/${workspace.id}`, { replace: true });
    }
  };

  const toggleTheme = (): void => {
    void setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className={`${styles.root} ${isReady ? styles.visible : ""}`}>
      {/* Background gradient orbs */}
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />

      {/* Top bar */}
      <header className={styles.topBar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span className={styles.logoText}>Open-Code.Studio</span>
        </div>
        <div className={styles.topBarActions}>
          <button
            className={styles.iconButton}
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className={styles.hero}>
        <div className={styles.badge}>v{platform?.appVersion ?? "0.1.0"} · Alpha</div>
        <h1 className={styles.headline}>
          One IDE.
          <br />
          Every Model.
          <br />
          Zero Vendor Lock-in.
        </h1>
        <p className={styles.tagline}>
          An AI-native software engineering platform that gives you complete ownership of your
          workflow, your models, and your code.
        </p>

        {/* CTA Cards */}
        <div className={styles.actions}>
          <button
            className={`${styles.card} ${styles.cardPrimary}`}
            onClick={async () => {
              try {
                const { canceled, folderPath } =
                  (await window.ocs?.workspace.openFolderDialog()) ?? {
                    canceled: true,
                    folderPath: null
                  };
                if (!canceled && folderPath) {
                  await openWorkspace(folderPath);
                }
              } catch (err) {
                console.error("Failed to open folder:", err);
              }
            }}
            title="Open a local folder as a workspace"
          >
            <span className={styles.cardIcon}>📁</span>
            <span className={styles.cardLabel}>Open Folder</span>
            <span className={styles.cardHint}>Browse local files</span>
          </button>

          <button
            className={styles.card}
            disabled={recent.length === 0}
            aria-disabled={recent.length === 0}
            title={recent.length === 0 ? "No recent projects yet" : "Open a recent project"}
            onClick={() => {
              if (recent[0]) {
                void openWorkspace(recent[0].uri.replace("file://", ""));
              }
            }}
          >
            <span className={styles.cardIcon}>🕐</span>
            <span className={styles.cardLabel}>Recent Projects</span>
            <span className={styles.cardHint}>
              {recent.length === 0
                ? "No projects yet"
                : `${recent.length} project${recent.length === 1 ? "" : "s"}`}
            </span>
          </button>

          <button className={styles.card} onClick={() => window.ocs?.window.minimize()}>
            <span className={styles.cardIcon}>📖</span>
            <span className={styles.cardLabel}>Documentation</span>
            <span className={styles.cardHint}>Explore the docs</span>
          </button>
        </div>

        {recent.length > 0 && (
          <div
            className={styles.recentProjects}
            style={{ marginTop: "2rem", textAlign: "left", width: "100%", maxWidth: "600px" }}
          >
            <h3
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                marginBottom: "0.5rem",
                letterSpacing: "0.05em"
              }}
            >
              Recent Workspaces
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem"
              }}
            >
              {recent.map((ws) => (
                <li key={ws.id}>
                  <button
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem",
                      background: "var(--color-bg-elevated)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      textAlign: "left",
                      color: "var(--color-text)"
                    }}
                    onClick={async () => {
                      try {
                        await openWorkspace(ws.uri.replace("file://", ""));
                      } catch (err) {
                        console.error("Failed to open recent workspace", err);
                      }
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 500, fontSize: "14px" }}>
                        {ws.displayName || ws.id}
                      </span>
                      <span
                        style={{ fontSize: "12px", color: "var(--color-text-muted)", opacity: 0.8 }}
                      >
                        {ws.uri.replace("file://", "")}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>{platform?.platform ? `Running on ${platform.platform}` : "Open-Code.Studio"}</span>
        <span>Phase 0 — Foundation</span>
      </footer>
    </div>
  );
}
