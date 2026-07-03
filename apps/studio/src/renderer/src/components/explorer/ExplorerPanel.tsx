import type { VisibleNode } from "@ocs/explorer";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { useState, useRef } from "react";

import { useExplorer } from "../../hooks/useExplorer.js";

import { ExplorerContextMenu, type ContextMenuItem } from "./ExplorerContextMenu.js";

const PROVIDER_ID = "explorer.provider.workspace";
const ROW_HEIGHT = 24;

export const ExplorerPanel: React.FC = () => {
  const { nodes } = useExplorer();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: VisibleNode;
  } | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: nodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5
  });

  const selectNode = async (visibleNode: VisibleNode): Promise<void> => {
    await window.ocs.explorer.selectNode(visibleNode.node.id);
  };

  const toggleExpand = async (visibleNode: VisibleNode): Promise<void> => {
    if (visibleNode.isExpanded) {
      await window.ocs.explorer.collapseNode(visibleNode.node.id);
    } else {
      await window.ocs.explorer.expandNode(PROVIDER_ID, visibleNode.node.id);
    }
  };

  const handleNodeClick = async (visibleNode: VisibleNode, index: number): Promise<void> => {
    setFocusedIndex(index);
    if (visibleNode.node.isDirectory) {
      await toggleExpand(visibleNode);
    } else {
      await selectNode(visibleNode);
    }
  };

  const buildContextMenuItems = (visibleNode: VisibleNode): ContextMenuItem[] => {
    const uri = visibleNode.node.uri?.toString() ?? visibleNode.node.id;
    const isDir = visibleNode.node.isDirectory;

    return [
      {
        label: "New File",
        disabled: !isDir,
        action: () => {
          const name = window.prompt("New file name:");
          if (name) {
            void window.ocs.explorer.executeCommand("explorer.command.createFile", {
              uri: `${uri}/${name}`,
              isDirectory: false
            });
          }
        }
      },
      {
        label: "New Folder",
        disabled: !isDir,
        action: () => {
          const name = window.prompt("New folder name:");
          if (name) {
            void window.ocs.explorer.executeCommand("explorer.command.createFile", {
              uri: `${uri}/${name}`,
              isDirectory: true
            });
          }
        }
      },
      { label: "", separator: true, action: () => {} },
      {
        label: "Rename",
        action: () => {
          const newName = window.prompt("Rename to:", visibleNode.node.name);
          if (newName && newName !== visibleNode.node.name) {
            const parentUri = uri.slice(0, uri.lastIndexOf("/"));
            void window.ocs.explorer.executeCommand("explorer.command.renameFile", {
              uri,
              targetUri: `${parentUri}/${newName}`
            });
          }
        }
      },
      {
        label: "Delete",
        action: () => {
          if (window.confirm(`Delete "${visibleNode.node.name}"?`)) {
            void window.ocs.explorer.executeCommand("explorer.command.deleteFile", { uri });
          }
        }
      },
      { label: "", separator: true, action: () => {} },
      {
        label: "Reveal in Finder",
        action: () => {
          void window.ocs.explorer.revealInFinder(uri);
        }
      },
      {
        label: "Copy Path",
        action: () => {
          void navigator.clipboard.writeText(uri.replace(/^file:\/\//, ""));
        }
      }
    ];
  };

  const handleKeyDown = async (e: React.KeyboardEvent): Promise<void> => {
    if (nodes.length === 0) return;

    const current = nodes[focusedIndex];
    if (!current) return;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const next = Math.min(focusedIndex + 1, nodes.length - 1);
        setFocusedIndex(next);
        virtualizer.scrollToIndex(next);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prev = Math.max(focusedIndex - 1, 0);
        setFocusedIndex(prev);
        virtualizer.scrollToIndex(prev);
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        if (current.node.isDirectory && !current.isExpanded) {
          await toggleExpand(current);
        }
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        if (current.node.isDirectory && current.isExpanded) {
          await window.ocs.explorer.collapseNode(current.node.id);
        }
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        await handleNodeClick(current, focusedIndex);
        break;
      }
      default:
        break;
    }
  };

  return (
    <>
      <div
        className="explorer-panel"
        ref={parentRef}
        tabIndex={0}
        role="tree"
        aria-label="Explorer"
        onKeyDown={(e) => {
          void handleKeyDown(e);
        }}
        style={{
          height: "100%",
          overflow: "auto",
          backgroundColor: "#1e1e1e",
          color: "#cccccc",
          fontSize: "13px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          outline: "none"
        }}
      >
        {nodes.length === 0 ? (
          <div style={{ padding: "12px", color: "#888", fontSize: "12px" }}>
            Open a folder to browse files
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative"
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const visibleNode = nodes[virtualItem.index];
              if (!visibleNode) return null;

              const paddingLeft = visibleNode.depth * 12 + 4;
              const isFocused = virtualItem.index === focusedIndex;
              const isSelected = visibleNode.isSelected;

              return (
                <div
                  key={visibleNode.node.id}
                  role="treeitem"
                  aria-selected={isSelected}
                  aria-expanded={visibleNode.node.isDirectory ? visibleNode.isExpanded : undefined}
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
                    backgroundColor: isSelected ? "#37373d" : isFocused ? "#2a2d2e" : "transparent",
                    outline: isFocused ? "1px solid #007acc" : "none",
                    outlineOffset: "-1px"
                  }}
                  onClick={() => {
                    void handleNodeClick(visibleNode, virtualItem.index);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setFocusedIndex(virtualItem.index);
                    void selectNode(visibleNode);
                    setContextMenu({ x: e.clientX, y: e.clientY, node: visibleNode });
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !isFocused) {
                      e.currentTarget.style.backgroundColor = "#2a2d2e";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !isFocused) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
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
                      color: visibleNode.node.isDirectory ? "#dcb67a" : "#519aba"
                    }}
                  >
                    {visibleNode.node.isDirectory ? "📁" : "📄"}
                  </span>
                  <span
                    style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
                  >
                    {visibleNode.node.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {contextMenu && (
        <ExplorerContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={buildContextMenuItems(contextMenu.node)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};
