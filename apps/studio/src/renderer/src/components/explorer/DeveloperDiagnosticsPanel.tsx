/* eslint-disable */
import React, { useEffect, useState } from "react";

import { useDiagnostics } from "../../hooks/useDiagnostics.js";

export const DeveloperDiagnosticsPanel: React.FC = () => {
  const { diagnostics: diag } = useDiagnostics();
  const [fps, setFps] = useState(0);

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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "40px",
        padding: "8px 16px",
        fontSize: "12px",
        color: "#b5b5b5",
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
    >
      <div style={{ flex: "0 0 auto", minWidth: "250px" }}>
        <h4
          style={{
            margin: "0 0 10px 0",
            color: "#858585",
            textTransform: "uppercase",
            fontSize: "10px",
            fontWeight: "bold",
            letterSpacing: "0.05em"
          }}
        >
          Subsystem Status
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px" }}>
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
      </div>

      {diag?.startupPhases && (
        <div style={{ flex: "1 1 auto", borderLeft: "1px solid #2d2d2d", paddingLeft: "40px" }}>
          <h4
            style={{
              margin: "0 0 10px 0",
              color: "#858585",
              textTransform: "uppercase",
              fontSize: "10px",
              fontWeight: "bold",
              letterSpacing: "0.05em"
            }}
          >
            Startup Sequence
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "6px 20px"
            }}
          >
            {diag.startupPhases.map((phase: any) => (
              <div
                key={phase.name}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span>{phase.name}</span>
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: "11px",
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
