import type { VisibleNode } from "@ocs/explorer";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { useEffect, useState, useRef } from "react";

import type { OcsAPI } from "../../../preload/preload.js";

declare global {
  interface Window {
    ocs: OcsAPI;
  }
}

export const ExplorerPanel: React.FC = () => {
  const [nodes, setNodes] = useState<VisibleNode[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const fetchNodes = async () => {
      try {
        const visibleNodes = await window.ocs.explorer.getVisibleNodes();
        if (mounted) setNodes(visibleNodes);
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

  const virtualizer = useVirtualizer({
    count: nodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24, // 24px row height
    overscan: 5
  });

  const handleNodeClick = async (visibleNode: VisibleNode) => {
    try {
      if (visibleNode.node.isDirectory) {
        if (visibleNode.isExpanded) {
          await window.ocs.explorer.collapseNode(visibleNode.node.id);
        } else {
          // providerId is a bit tricky here since we flattened it, but let's assume workspace provider for now
          // A proper implementation would include providerId in the VisibleNode or parse it.
          await window.ocs.explorer.expandNode("explorer.provider.workspace", visibleNode.node.id);
        }
      } else {
        await window.ocs.explorer.selectNode(visibleNode.node.id);
      }
    } catch (e: unknown) {
      console.error("Failed to interact with node", e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div
      className="explorer-panel"
      ref={parentRef}
      style={{
        height: "100%",
        overflow: "auto",
        backgroundColor: "#1e1e1e",
        color: "#cccccc",
        fontSize: "13px",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative"
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const visibleNode = nodes[virtualItem.index];
          if (!visibleNode) return null; // Safe guard

          const paddingLeft = visibleNode.depth * 12 + 4;

          return (
            <div
              key={visibleNode.node.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
                display: "flex",
                alignItems: "center",
                paddingLeft: `${paddingLeft}px`,
                cursor: "pointer",
                userSelect: "none",
                backgroundColor: visibleNode.isSelected ? "#37373d" : "transparent"
              }}
              onClick={() => {
                void handleNodeClick(visibleNode);
              }}
              onMouseEnter={(e) => {
                if (!visibleNode.isSelected) e.currentTarget.style.backgroundColor = "#2a2d2e";
              }}
              onMouseLeave={(e) => {
                if (!visibleNode.isSelected) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {visibleNode.node.isDirectory && (
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "10px",
                    width: "12px",
                    display: "inline-block",
                    textAlign: "center"
                  }}
                >
                  {visibleNode.isExpanded ? "▼" : "▶"}
                </span>
              )}
              {!visibleNode.node.isDirectory && <span style={{ width: "16px" }} />}

              <span
                style={{
                  marginRight: "6px",
                  color: visibleNode.node.isDirectory ? "#dcb67a" : "#519aba" // Poor man's file icons
                }}
              >
                {visibleNode.node.isDirectory ? "📁" : "📄"}
              </span>
              <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {visibleNode.node.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
