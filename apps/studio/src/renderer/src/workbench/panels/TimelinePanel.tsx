import React, { useEffect, useState } from "react";

import { useEditor } from "../../hooks/useEditor.js";

interface CommitInfo {
  id: string;
  message: string;
  author: string;
  date: string;
}

export const TimelinePanel: React.FC = () => {
  const { editorState } = useEditor();
  const [history, setHistory] = useState<CommitInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeGroup = editorState?.groups?.find((g) => g.id === editorState.activeGroup);
  const activeInput = activeGroup?.activeInput;

  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      if (!activeInput) {
        if (mounted) setHistory([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        if (window.ocs?.git?.history) {
          const pathStr = activeInput.startsWith("file://")
            ? activeInput.replace("file://", "")
            : activeInput;
          const commits = (await window.ocs.git.history(pathStr)) as CommitInfo[] | null;
          if (mounted) {
            setHistory(commits || []);
          }
        }
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load history");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchHistory();
    return () => {
      mounted = false;
    };
  }, [activeInput]);

  if (!activeInput) {
    return (
      <div style={{ padding: "8px", color: "var(--workbench-text-muted)" }}>
        No active editor to provide timeline.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "8px", color: "var(--workbench-text-muted)" }}>
        Loading timeline...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "8px", color: "var(--workbench-text-muted)" }}>Error: {error}</div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={{ padding: "8px", color: "var(--workbench-text-muted)" }}>
        No history found for this file.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
      {history.map((commit) => (
        <div
          key={commit.id}
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "4px 8px",
            borderBottom: "1px solid var(--workbench-border)",
            cursor: "pointer",
            fontSize: "12px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          title={commit.message}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                color: "var(--workbench-text)",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {commit.message}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "var(--workbench-text-muted)",
              fontSize: "11px",
              marginTop: "2px"
            }}
          >
            <span>{commit.author}</span>
            <span>{commit.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
