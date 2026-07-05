import { FileIcon } from "@ocs/ui";
import React from "react";

import { type SplitNode, useEditor } from "../../hooks/useEditor.js";

import { Breadcrumbs } from "./Breadcrumbs.js";
import { MonacoEditorView } from "./MonacoEditorView.js";
import { ExtensionEditorView } from "../extensions/ExtensionEditorView.js";

export const EditorArea: React.FC = () => {
  const { editorState, isLoading, open, close } = useEditor();

  if (isLoading) {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: "var(--workbench-background)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--workbench-text-muted)"
        }}
      >
        Loading Editor...
      </div>
    );
  }

  // Recursive SplitNode renderer
  const RenderSplitNode: React.FC<{ node: SplitNode }> = ({ node }) => {
    if (!node) return null;

    if (node.type === "group") {
      return <EditorGroupView groupId={node.groupId} />;
    }

    const isHorizontal = node.orientation === "horizontal";

    return (
      <div
        style={{
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          width: "100%",
          height: "100%",
          flex: 1,
          minWidth: 0,
          minHeight: 0
        }}
      >
        <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          <RenderSplitNode node={node.left} />
        </div>
        <div
          style={{
            width: isHorizontal ? "1px" : "100%",
            height: isHorizontal ? "100%" : "1px",
            backgroundColor: "var(--workbench-border)",
            zIndex: 10
          }}
        />
        <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          <RenderSplitNode node={node.right} />
        </div>
      </div>
    );
  };

  const getFileName = (uriStr: string) => {
    try {
      const parts = uriStr.split("/");
      return parts[parts.length - 1] || uriStr;
    } catch {
      return uriStr;
    }
  };

  const EmptyState: React.FC = () => {
    return (
      <div
        style={{
          flex: 1,
          height: "100%",
          backgroundColor: "var(--workbench-background)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 0,
          color: "var(--workbench-text-secondary)"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--spacing-lg)",
            padding: "var(--spacing-xl)",
            maxWidth: "360px",
            width: "100%"
          }}
        >
          {/* Glowing Brand SVG Logo */}
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: "drop-shadow(0 0 8px var(--workbench-accent))" }}
          >
            <path
              d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
              stroke="var(--workbench-accent)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M8 10l-3 2 3 2M16 10l3 2-3 2"
              stroke="var(--workbench-text)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="2" fill="var(--workbench-accent)" />
          </svg>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-sm)",
              width: "100%",
              backgroundColor: "var(--workbench-panel)",
              border: "1px solid var(--workbench-border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--spacing-md)"
            }}
          >
            {[
              { label: "Show All Commands", key: "⌘⇧P" },
              { label: "Open Folder", key: "⌘O" },
              { label: "Toggle Sidebar", key: "⌘B" },
              { label: "Explorer View", key: "⌘⇧E" }
            ].map((shortcut) => (
              <div
                key={shortcut.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "12px",
                  height: "28px"
                }}
              >
                <span style={{ color: "var(--workbench-text-secondary)", fontWeight: 500 }}>
                  {shortcut.label}
                </span>
                <kbd
                  style={{
                    backgroundColor: "var(--color-bg-hover)",
                    padding: "2px 6px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--workbench-text)",
                    border: "1px solid var(--workbench-border)"
                  }}
                >
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // View for an individual editor group
  const EditorGroupView: React.FC<{ groupId: string }> = ({ groupId }) => {
    const group = editorState?.groups?.find((g) => g.id === groupId);

    if (!group || !group.inputs || group.inputs.length === 0) {
      return <EmptyState />;
    }

    const activeInputId = group.activeInput;

    const handleTabClick = (uriStr: string) => {
      void open(uriStr);
    };

    const handleTabDoubleClick = (uriStr: string) => {
      if (window.ocs?.commands?.execute) {
        void window.ocs.commands.execute("editor.pin", { uri: uriStr });
      }
    };

    const handleTabClose = (e: React.MouseEvent, uriStr: string) => {
      e.stopPropagation();
      void close(uriStr, groupId);
    };

    const handleSplitRight = () => {
      if (window.ocs?.commands?.execute) {
        void window.ocs.commands.execute("editor.splitRight");
      }
    };

    const handleSplitDown = () => {
      if (window.ocs?.commands?.execute) {
        void window.ocs.commands.execute("editor.splitDown");
      }
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "var(--workbench-background)",
          minWidth: 0,
          minHeight: 0
        }}
      >
        {/* Tab Bar Container */}
        <div
          style={{
            display: "flex",
            backgroundColor: "var(--workbench-titlebar)",
            height: "35px",
            borderBottom: "1px solid var(--workbench-border)",
            justifyContent: "space-between",
            alignItems: "center",
            paddingRight: "8px",
            userSelect: "none"
          }}
        >
          {/* Scrollable Tabs */}
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              flex: 1,
              height: "100%"
            }}
          >
            {group.inputs.map((tabId: string) => {
              const isActive = activeInputId === tabId;
              const isPreview = group.previewInput === tabId;
              const fileName = getFileName(tabId);
              const isDirty = group.dirtyInputs?.includes(tabId);

              return (
                <div
                  key={tabId}
                  onClick={() => handleTabClick(tabId)}
                  onDoubleClick={() => handleTabDoubleClick(tabId)}
                  onAuxClick={(e) => {
                    if (e.button === 1) handleTabClose(e, tabId);
                  }}
                  className="editor-tab"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 16px",
                    height: "100%",
                    backgroundColor: isActive
                      ? "var(--workbench-background)"
                      : "var(--workbench-panel)",
                    borderRight: "1px solid var(--workbench-border)",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: isActive ? "var(--workbench-text)" : "var(--workbench-text-secondary)",
                    fontStyle: isPreview ? "italic" : "normal",
                    gap: "8px",
                    borderTop: isActive ? "1px solid var(--workbench-accent)" : "none"
                  }}
                >
                  <FileIcon
                    size={14}
                    style={{
                      color: isActive ? "var(--workbench-accent)" : "var(--workbench-text-muted)"
                    }}
                  />
                  <span>{fileName}</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "16px",
                      height: "16px",
                      marginLeft: "4px"
                    }}
                    className="tab-action-container"
                  >
                    {isDirty ? (
                      <span
                        className="dirty-dot"
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "var(--color-warning, #f0ad4e)"
                        }}
                      />
                    ) : null}
                    <div
                      onClick={(e) => handleTabClose(e, tabId)}
                      className="close-btn"
                      style={{
                        display: isDirty ? "none" : "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "14px",
                        height: "14px",
                        borderRadius: "2px",
                        color: "var(--workbench-text-muted)",
                        fontSize: "10px"
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          "var(--color-bg-hover)";
                        (e.currentTarget as HTMLElement).style.color = "var(--workbench-text)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--workbench-text-muted)";
                      }}
                    >
                      ×
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Group Toolbars */}
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <button
              onClick={handleSplitRight}
              title="Split Editor Right"
              style={{
                background: "none",
                border: "none",
                color: "var(--workbench-text-muted)",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "3px",
                fontSize: "12px"
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-bg-hover)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
              }
            >
              Split Right
            </button>
            <button
              onClick={handleSplitDown}
              title="Split Editor Down"
              style={{
                background: "none",
                border: "none",
                color: "var(--workbench-text-muted)",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "3px",
                fontSize: "12px"
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-bg-hover)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
              }
            >
              Split Down
            </button>
          </div>
        </div>

        {/* Editor Area Content */}
        <div
          style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}
        >
          {activeInputId && (
            <>
              <Breadcrumbs activeInputId={activeInputId} />
              {activeInputId.startsWith("extension://") ? (
                <ExtensionEditorView input={{ id: activeInputId }} />
              ) : (
                <MonacoEditorView input={{ id: activeInputId }} />
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const layoutRoot = editorState?.layout?.root;

  return (
    <div style={{ flex: 1, height: "100%", display: "flex", minWidth: 0, minHeight: 0 }}>
      {layoutRoot ? <RenderSplitNode node={layoutRoot} /> : <EmptyState />}
    </div>
  );
};
