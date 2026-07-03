import React, { useEffect, useState } from "react";

interface DiagnosticsState {
  desktop: boolean;
  workspace: boolean;
  explorer: boolean;
  fileWatcher: boolean;
  eventBus: boolean;
  logger: boolean;
  ipc: boolean;
  visibleNodes: number;
  expandedCount: number;
  totalNodes: number;
}

export const DeveloperDiagnosticsPanel: React.FC = () => {
  const [diag, setDiag] = useState<DiagnosticsState | null>(null);
  const [fps, setFps] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchDiag = async (): Promise<void> => {
      try {
        const data = await window.ocs.diagnostics.get();
        if (mounted) setDiag(data);
      } catch (e: unknown) {
        console.error("Failed to fetch diagnostics", e instanceof Error ? e.message : String(e));
      }
    };

    void fetchDiag();
    const unsubscribe = window.ocs.explorer.onStateChanged(() => {
      void fetchDiag();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

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
        <span>Event Bus {check(diag?.eventBus ?? false)}</span>
        <span>Logger {check(diag?.logger ?? false)}</span>
        <span>IPC {check(diag?.ipc ?? false)}</span>
        <span>FPS {fps}</span>
        <span>Visible Nodes {diag?.visibleNodes ?? 0}</span>
        <span>Expanded {diag?.expandedCount ?? 0}</span>
      </div>
    </div>
  );
};
