/* eslint-disable */
import React, { useEffect, useState } from "react";

import { useDiagnostics } from "../../hooks/useDiagnostics.js";

export const DeveloperDiagnosticsPanel: React.FC = () => {
  const { diagnostics: diag } = useDiagnostics();
  const [fps, setFps] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const calculateFPS = (): void => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      animationFrameId = requestAnimationFrame(calculateFPS);
    };

    animationFrameId = requestAnimationFrame(calculateFPS);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const check = (ok: boolean): string => (ok ? "✅" : "⬜");

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        style={{
          padding: "4px 8px",
          borderTop: "1px solid #333",
          background: "#1a1a1a",
          border: "none",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "#333",
          color: "#666",
          fontSize: "10px",
          cursor: "pointer",
          width: "100%",
          textAlign: "left"
        }}
      >
        Developer Mode ▸
      </button>
    );
  }

  return (
    <div
      style={{
        padding: "8px",
        borderTop: "1px solid #333",
        fontSize: "11px",
        color: "#888",
        backgroundColor: "#1a1a1a",
        flexShrink: 0
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <strong style={{ color: "#aaa" }}>Developer Mode</strong>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          style={{
            background: "none",
            border: "none",
            color: "#666",
            cursor: "pointer",
            fontSize: "10px"
          }}
        >
          ▾
        </button>
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px", lineHeight: 1.5 }}
      >
        <span>Desktop {check(diag?.desktop ?? false)}</span>
        <span>Workspace {check(diag?.workspace ?? false)}</span>
        <span>Explorer {check(diag?.explorer ?? false)}</span>
        <span>File Watcher {check(diag?.fileWatcher ?? false)}</span>
        <span>Document {check(diag?.document ?? false)}</span>
        <span>Editor {check(diag?.editor ?? false)}</span>
        <span>Commands {check(diag?.commands ?? false)}</span>
        <span>IPC {check(diag?.ipc ?? false)}</span>
        <span>FPS {fps}</span>
        <span>Visible Nodes {diag?.visibleNodes ?? 0}</span>
      </div>

      {diag?.startupPhases && (
        <div style={{ marginTop: "8px", borderTop: "1px dashed #333", paddingTop: "4px" }}>
          <strong style={{ color: "#aaa" }}>Startup Sequence</strong>
          <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "2px" }}>
            {diag.startupPhases.map((phase: any) => (
              <div key={phase.name} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{phase.name}</span>
                <span
                  style={{
                    color:
                      phase.status === "done"
                        ? "#4caf50"
                        : phase.status === "failed"
                          ? "#f44336"
                          : phase.status === "running"
                            ? "#ff9800"
                            : "#888"
                  }}
                >
                  {phase.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
