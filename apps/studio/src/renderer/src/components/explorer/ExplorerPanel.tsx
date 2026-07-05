import type { VisibleNode } from "@ocs/explorer";
import {
  FolderIcon,
  FolderOpenIcon,
  FileIcon,
  FolderGithubIcon,
  FolderDockerIcon,
  FolderAngularIcon,
  FolderVscodeIcon,
  FileYamlIcon
} from "@ocs/ui";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { useState, useRef } from "react";

import { useExplorer } from "../../hooks/useExplorer.js";
import { useIconTheme } from "../../hooks/useIconTheme.js";

import { ExplorerContextMenu, type ContextMenuItem } from "./ExplorerContextMenu.js";

const PROVIDER_ID = "explorer.provider.workspace";
const ROW_HEIGHT = 26;

export const ExplorerPanel: React.FC = () => {
  const { nodes, selectNode, collapseNode, expandNode, executeCommand, revealInFinder } =
    useExplorer();
  const { getIconUrl } = useIconTheme();
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

  const handleSelectNode = async (
    visibleNode: VisibleNode,
    preview: boolean = true
  ): Promise<void> => {
    await selectNode(visibleNode.node.id);
    if (!visibleNode.node.isDirectory && window.ocs?.editor?.open) {
      await window.ocs.editor.open(visibleNode.node.id, {
        preview,
        active: true
      });
    }
  };

  const toggleExpand = async (visibleNode: VisibleNode): Promise<void> => {
    if (visibleNode.isExpanded) {
      await collapseNode(visibleNode.node.id);
    } else {
      await expandNode(PROVIDER_ID, visibleNode.node.id);
    }
  };

  const handleNodeClick = async (visibleNode: VisibleNode, index: number): Promise<void> => {
    setFocusedIndex(index);
    if (visibleNode.node.isDirectory) {
      await toggleExpand(visibleNode);
    } else {
      await handleSelectNode(visibleNode, true);
    }
  };

  const handleNodeDoubleClick = async (visibleNode: VisibleNode): Promise<void> => {
    if (!visibleNode.node.isDirectory) {
      await handleSelectNode(visibleNode, false);
    }
  };

  const buildContextMenuItems = (visibleNode: VisibleNode): ContextMenuItem[] => {
    const nodeData = visibleNode.node as { uri?: { toString: () => string }; id: string };
    const uri: string = nodeData.uri ? nodeData.uri.toString() : visibleNode.node.id;
    const isDir = visibleNode.node.isDirectory;

    return [
      {
        label: "New File",
        disabled: !isDir,
        action: () => {
          const name = window.prompt("New file name:");
          if (name) {
            void executeCommand("explorer.command.createFile", {
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
            void executeCommand("explorer.command.createFile", {
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
            void executeCommand("explorer.command.renameFile", {
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
            void executeCommand("explorer.command.deleteFile", { uri });
          }
        }
      },
      { label: "", separator: true, action: () => {} },
      {
        label: "Reveal in Finder",
        action: () => {
          void revealInFinder(uri);
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
          await collapseNode(current.node.id);
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
          backgroundColor: "var(--workbench-sidebar)",
          color: "var(--workbench-text-secondary)",
          fontSize: "14px",
          fontFamily: "var(--font-sans)",
          outline: "none"
        }}
      >
        {nodes.length === 0 ? (
          <div style={{ padding: "12px", color: "var(--workbench-text-muted)", fontSize: "12px" }}>
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

              const isFocused = virtualItem.index === focusedIndex;
              const isSelected = visibleNode.isSelected;

              return (
                <div
                  key={visibleNode.node.id}
                  role="treeitem"
                  aria-selected={isSelected}
                  aria-expanded={visibleNode.node.isDirectory ? visibleNode.isExpanded : undefined}
                  style={
                    visibleNode.depth === 0
                      ? {
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          userSelect: "none",
                          padding: "0 4px 0 2px",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          fontSize: "11px",
                          letterSpacing: "0.02em",
                          backgroundColor: isSelected
                            ? "var(--workbench-accent-hover)"
                            : isFocused
                              ? "var(--color-bg-hover)"
                              : "transparent",
                          color:
                            isFocused || isSelected
                              ? "var(--workbench-text)"
                              : "var(--workbench-text-secondary)",
                          outline: "none"
                        }
                      : {
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                          display: "flex",
                          alignItems: "center",
                          paddingLeft: `${(visibleNode.depth - 1) * 16 + 16}px`,
                          cursor: "pointer",
                          userSelect: "none",
                          backgroundColor: isSelected
                            ? "rgba(255, 255, 255, 0.05)"
                            : isFocused
                              ? "var(--color-bg-hover)"
                              : "transparent",
                          color: isSelected
                            ? "var(--workbench-text)"
                            : "var(--workbench-text-secondary)",
                          outline: "none"
                        }
                  }
                  onClick={() => {
                    void handleNodeClick(visibleNode, virtualItem.index);
                  }}
                  onDoubleClick={() => {
                    void handleNodeDoubleClick(visibleNode);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setFocusedIndex(virtualItem.index);
                    void handleSelectNode(visibleNode, true);
                    setContextMenu({ x: e.clientX, y: e.clientY, node: visibleNode });
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !isFocused) {
                      e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
                    }
                    if (visibleNode.depth === 0) {
                      const actions = e.currentTarget.querySelector(
                        ".explorer-actions"
                      ) as HTMLElement;
                      if (actions) actions.style.opacity = "1";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !isFocused) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                    if (visibleNode.depth === 0) {
                      const actions = e.currentTarget.querySelector(
                        ".explorer-actions"
                      ) as HTMLElement;
                      if (actions) actions.style.opacity = "0";
                    }
                  }}
                >
                  {(isSelected || isFocused) && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "3px",
                        height: "16px",
                        backgroundColor: "var(--workbench-accent)",
                        borderRadius: "0 3px 3px 0"
                      }}
                    />
                  )}
                  {visibleNode.depth === 0 ? (
                    <>
                      <span
                        style={{
                          transform: visibleNode.isExpanded ? "rotate(90deg)" : "none",
                          transition: "transform 0.1s",
                          display: "inline-flex",
                          width: "20px",
                          justifyContent: "center",
                          color: "inherit"
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.2 3.5l4.8 4.5-4.8 4.5h1.6l4.8-4.5-4.8-4.5H4.2z"
                          />
                        </svg>
                      </span>
                      <span
                        style={{
                          flex: 1,
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {visibleNode.node.name}
                      </span>
                      <div
                        className="explorer-actions"
                        style={{
                          display: "flex",
                          opacity: 0,
                          transition: "opacity 0.1s",
                          gap: "2px"
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          title="New File (Disabled until EPIC-7)"
                          style={{
                            padding: "2px",
                            opacity: 0.35,
                            cursor: "not-allowed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "3px"
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M13.5 1h-8L3 3.5V14h10.5V1zM5.5 2H12v11H4V4.5H5.5V2zm4 4H7V5h1v1zm0 2H7V7h1v1zm2-4H10v1h1V4z" />
                          </svg>
                        </div>
                        <div
                          title="New Folder (Disabled until EPIC-7)"
                          style={{
                            padding: "2px",
                            opacity: 0.35,
                            cursor: "not-allowed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "3px"
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M14.5 4H8.7l-1-2H2.5v11h12V4zm-1 9H3.5V5h10v8z" />
                          </svg>
                        </div>
                        <div
                          title="Refresh"
                          onClick={() => {
                            // simulate refresh
                          }}
                          style={{
                            padding: "2px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "3px"
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--workbench-accent-hover)")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor = "transparent")
                          }
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 2a5.9 5.9 0 0 0-4.2 1.7L2.4 2.4l-.4.4v4h4l.4-.4-1.7-1.7A4.9 4.9 0 1 1 3 8h-1a5.9 5.9 0 1 0 6-6z" />
                          </svg>
                        </div>
                        <div
                          title="Collapse All"
                          onClick={() => {
                            void (async () => {
                              const expanded = nodes.filter(
                                (n) => n.node.isDirectory && n.isExpanded
                              );
                              for (const item of expanded) {
                                await collapseNode(item.node.id);
                              }
                            })();
                          }}
                          style={{
                            padding: "2px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "3px"
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--workbench-accent-hover)")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor = "transparent")
                          }
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M13 13V2h-1v11h1zM3 13V2H2v11h1zm7.5-6.5l-2-2-.7.7 1.1 1.1-1.1 1.1.7.7 2-1.6zM6.5 6.5l-2-2-.7.7 1.1 1.1-1.1 1.1.7.7 2-1.6z" />
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {visibleNode.node.isDirectory && (
                        <span
                          style={{
                            marginRight: "2px",
                            display: "inline-flex",
                            width: "16px",
                            justifyContent: "center",
                            transform: visibleNode.isExpanded ? "rotate(90deg)" : "none",
                            transition: "transform 0.1s"
                          }}
                        >
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M4.2 3.5l4.8 4.5-4.8 4.5h1.6l4.8-4.5-4.8-4.5H4.2z"
                            />
                          </svg>
                        </span>
                      )}
                      {!visibleNode.node.isDirectory && <span style={{ width: "18px" }} />}

                      {(() => {
                        const nodeName = visibleNode.node.name.toLowerCase();

                        // Check custom icon theme
                        const customIconUrl = getIconUrl(
                          nodeName,
                          visibleNode.node.isDirectory,
                          visibleNode.isExpanded
                        );
                        if (customIconUrl) {
                          return (
                            <img
                              src={customIconUrl}
                              width={16}
                              height={16}
                              style={{ marginRight: "6px" }}
                              alt=""
                            />
                          );
                        }

                        let Icon: React.ElementType = visibleNode.node.isDirectory
                          ? visibleNode.isExpanded
                            ? FolderOpenIcon
                            : FolderIcon
                          : FileIcon;

                        if (visibleNode.node.isDirectory) {
                          if (nodeName === ".github") Icon = FolderGithubIcon;
                          else if (nodeName === ".docker") Icon = FolderDockerIcon;
                          else if (nodeName === ".angular") Icon = FolderAngularIcon;
                          else if (nodeName === ".vscode") Icon = FolderVscodeIcon;
                        } else {
                          if (nodeName === "actions.yaml" || nodeName === "actions.yml")
                            Icon = FileYamlIcon;
                        }

                        return (
                          <Icon
                            size={16}
                            style={{
                              marginRight: "6px",
                              color: "var(--workbench-text-secondary)",
                              opacity: 0.8
                            }}
                          />
                        );
                      })()}
                      <span
                        style={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {visibleNode.node.name}
                      </span>
                    </>
                  )}
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
