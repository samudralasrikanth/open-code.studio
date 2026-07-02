/* eslint-disable */
import type { VisibleNode } from "@ocs/explorer";
import React, { useEffect, useState } from "react";

import type { OcsAPI } from "../../../preload/preload.js";

declare global {
  interface Window {
    ocs: OcsAPI;
  }
}

export const DeveloperDiagnosticsPanel: React.FC = () => {
  const [nodes, setNodes] = useState<VisibleNode[]>([]);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchNodes = async () => {
      try {
        const visibleNodes = await window.ocs.explorer.getVisibleNodes();
        if (mounted) {
          setNodes(visibleNodes);
          setRenderCount((c) => c + 1);
        }
      } catch (e: unknown) {
        console.error("Failed to fetch visible nodes", e instanceof Error ? e.message : String(e));
      }
    };

    void fetchNodes();

    const unsubscribe = window.ocs.explorer.onStateChanged(() => {
      void fetchNodes();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState<string>("Unknown");

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const calculateFPS = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;

        // Also update memory if available
        if ("memory" in performance) {
          const perfMem = (performance as any).memory;
          setMemory(`${(perfMem.usedJSHeapSize / 1048576).toFixed(1)} MB`);
        }
      }
      animationFrameId = requestAnimationFrame(calculateFPS);
    };

    animationFrameId = requestAnimationFrame(calculateFPS);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div style={{ padding: "8px", borderTop: "1px solid #333", fontSize: "11px", color: "#888" }}>
      <div>
        <strong>Explorer Diagnostics</strong>
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginTop: "4px" }}
      >
        <div>Visible Nodes: {nodes.length}</div>
        <div>Render Count: {renderCount}</div>
        <div>FPS: {fps}</div>
        <div>Memory: {memory}</div>
      </div>
      <div style={{ marginTop: "4px" }}>
        <em>(Performance telemetry active)</em>
      </div>
    </div>
  );
};
