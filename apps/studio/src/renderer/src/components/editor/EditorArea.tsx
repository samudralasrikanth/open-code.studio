import { FileIcon } from "@ocs/ui";
import React from "react";

import { type SplitNode, useEditor } from "../../hooks/useEditor.js";

import { MonacoEditorView } from "./MonacoEditorView";

export const EditorArea: React.FC = () => {
  const { editorState, isLoading, open, close } = useEditor();

  if (isLoading) {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: "#1e1e1e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#858585"
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
            backgroundColor: "#2d2d2d",
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

  // View for an individual editor group
  const EditorGroupView: React.FC<{ groupId: string }> = ({ groupId }) => {
    const group = editorState?.groups?.find((g) => g.id === groupId);

    if (!group || !group.inputs || group.inputs.length === 0) {
      return (
        <div
          style={{
            flex: 1,
            height: "100%",
            backgroundColor: "#1e1e1e",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 0
          }}
        >
          <div style={{ textAlign: "center", opacity: 0.6, maxWidth: "400px", padding: "24px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px"
              }}
            >
              <h2 style={{ fontSize: "18px", fontWeight: 500, color: "#ccc", margin: "0 0 8px" }}>
                Open-Code.Studio
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  width: "240px",
                  fontSize: "13px",
                  color: "#858585"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span>Open Folder</span>
                  <kbd
                    style={{
                      backgroundColor: "#2d2d2d",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      fontSize: "11px",
                      color: "#ccc",
                      border: "1px solid #444"
                    }}
                  >
                    ⌘O
                  </kbd>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span>Toggle Sidebar</span>
                  <kbd
                    style={{
                      backgroundColor: "#2d2d2d",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      fontSize: "11px",
                      color: "#ccc",
                      border: "1px solid #444"
                    }}
                  >
                    ⌘B
                  </kbd>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span>Explorer View</span>
                  <kbd
                    style={{
                      backgroundColor: "#2d2d2d",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      fontSize: "11px",
                      color: "#ccc",
                      border: "1px solid #444"
                    }}
                  >
                    ⌘⇧E
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
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
          backgroundColor: "#1e1e1e",
          minWidth: 0,
          minHeight: 0
        }}
      >
        {/* Tab Bar Container */}
        <div
          style={{
            display: "flex",
            backgroundColor: "#181818",
            height: "35px",
            borderBottom: "1px solid #252526",
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

              return (
                <div
                  key={tabId}
                  onClick={() => handleTabClick(tabId)}
                  onDoubleClick={() => handleTabDoubleClick(tabId)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 16px",
                    height: "100%",
                    backgroundColor: isActive ? "#1e1e1e" : "#2d2d2d",
                    borderRight: "1px solid #252526",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: isActive ? "#ffffff" : "#969696",
                    fontStyle: isPreview ? "italic" : "normal",
                    gap: "8px",
                    borderTop: isActive ? "1px solid #007acc" : "none"
                  }}
                >
                  <FileIcon size={14} style={{ color: isActive ? "#007acc" : "#858585" }} />
                  <span>{fileName}</span>
                  <div
                    onClick={(e) => handleTabClose(e, tabId)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "14px",
                      height: "14px",
                      borderRadius: "2px",
                      color: "#969696",
                      fontSize: "10px",
                      marginLeft: "4px"
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "#333333";
                      (e.currentTarget as HTMLElement).style.color = "#ff5f56";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "#969696";
                    }}
                  >
                    ×
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
                color: "#858585",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "3px",
                fontSize: "12px"
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = "#2d2d2d")
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
                color: "#858585",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "3px",
                fontSize: "12px"
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = "#2d2d2d")
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
        <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          {activeInputId && <MonacoEditorView input={{ id: activeInputId }} />}
        </div>
      </div>
    );
  };

  const layoutRoot = editorState?.layout?.root;

  return (
    <div style={{ flex: 1, height: "100%", display: "flex", minWidth: 0, minHeight: 0 }}>
      {layoutRoot ? (
        <RenderSplitNode node={layoutRoot} />
      ) : (
        <div
          style={{
            flex: 1,
            backgroundColor: "#1e1e1e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#858585"
          }}
        >
          No active workspace or editor layout.
        </div>
      )}
    </div>
  );
};
