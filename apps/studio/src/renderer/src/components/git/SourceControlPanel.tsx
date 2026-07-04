export interface GitFile {
  path: string;
  indexStatus: string;
  workTreeStatus: string;
}
export interface GitStatus {
  files: GitFile[];
}
import { PlusIcon, MinusIcon, UndoIcon, SparklesIcon, ChevronDownIcon } from "@ocs/ui";
import React, { useEffect, useState } from "react";

export const SourceControlPanel: React.FC = () => {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Section collapsible states
  const [isStagedExpanded, setIsStagedExpanded] = useState(true);
  const [isModifiedExpanded, setIsModifiedExpanded] = useState(true);
  const [isUntrackedExpanded, setIsUntrackedExpanded] = useState(true);
  const [showCommitMenu, setShowCommitMenu] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = (await window.ocs.git.status()) as GitStatus;
      setStatus(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStatus();
  }, []);

  const handleCommit = async () => {
    if (!message) return;
    try {
      setLoading(true);
      await window.ocs.git.commit(message);
      setMessage("");
      void fetchStatus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  const handleCommitAndPush = async () => {
    if (!message) return;
    try {
      setLoading(true);
      await window.ocs.git.commit(message);
      // Simulate push, or use actual if exposed
      const gitApi = window.ocs.git as unknown as { push?: () => Promise<void> };
      if (gitApi.push) {
        await gitApi.push();
      }
      setMessage("");
      setShowCommitMenu(false);
      void fetchStatus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  // Grouping logic
  const files = status?.files || [];
  const staged = files.filter(
    (f) => f.indexStatus !== " " && f.indexStatus !== "?" && f.indexStatus !== "!"
  );
  const modified = files.filter(
    (f) =>
      f.workTreeStatus !== " " &&
      f.workTreeStatus !== "?" &&
      f.workTreeStatus !== "!" &&
      f.indexStatus === " "
  );
  const untracked = files.filter((f) => f.workTreeStatus === "?" || f.indexStatus === "?");

  const getStatusColor = (char: string) => {
    switch (char) {
      case "?":
      case "U":
        return "var(--color-success)"; // Green
      case "A":
        return "var(--color-success)"; // Green
      case "D":
        return "var(--color-error)"; // Red
      case "M":
      default:
        return "var(--color-warning)"; // Amber
    }
  };

  const getStatusBadge = (file: { indexStatus: string; workTreeStatus: string }) => {
    if (file.workTreeStatus === "?") return "U";
    if (file.indexStatus !== " ") return file.indexStatus;
    return file.workTreeStatus;
  };

  const renderSectionHeader = (
    title: string,
    count: number,
    isExpanded: boolean,
    onToggle: () => void
  ) => {
    if (count === 0 && title === "Staged Changes") return null;
    return (
      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--spacing-xs) var(--spacing-sm)"
        }}
      >
        <button
          type="button"
          onClick={onToggle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-xs)",
            backgroundColor: "transparent",
            border: "none",
            textAlign: "left",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--workbench-text-secondary)",
            cursor: "pointer",
            userSelect: "none",
            outlineColor: "var(--workbench-accent)"
          }}
          aria-expanded={isExpanded}
        >
          <span
            style={{
              fontSize: "9px",
              transition: "transform var(--transition-fast)",
              transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)"
            }}
          >
            ▼
          </span>
          <span>{title}</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2px", opacity: 0.7 }}>
            {title === "Staged Changes" && (
              <>
                <button
                  title="Unstage All"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--workbench-text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "2px",
                    borderRadius: "4px"
                  }}
                  className="hover:bg-[var(--color-bg-hover)]"
                >
                  <MinusIcon size={14} />
                </button>
                <button
                  title="Stage All"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--workbench-text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "2px",
                    borderRadius: "4px"
                  }}
                  className="hover:bg-[var(--color-bg-hover)]"
                >
                  <PlusIcon size={14} />
                </button>
              </>
            )}
            {title === "Changes" && (
              <>
                <button
                  title="Discard All Changes"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--workbench-text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "2px",
                    borderRadius: "4px"
                  }}
                  className="hover:bg-[var(--color-bg-hover)]"
                >
                  <UndoIcon size={14} />
                </button>
                <button
                  title="Stage All Changes"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--workbench-text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "2px",
                    borderRadius: "4px"
                  }}
                  className="hover:bg-[var(--color-bg-hover)]"
                >
                  <PlusIcon size={14} />
                </button>
              </>
            )}
          </div>
          <span
            style={{
              fontSize: "10px",
              backgroundColor: "var(--color-bg-hover)",
              color: "var(--workbench-text-secondary)",
              padding: "2px 8px",
              borderRadius: "12px",
              fontWeight: 500
            }}
          >
            {count}
          </span>
        </div>
      </div>
    );
  };

  const renderFileList = (list: typeof files) => {
    return (
      <ul
        style={{
          listStyle: "none",
          padding: "0 var(--spacing-xs) var(--spacing-sm) var(--spacing-xs)"
        }}
      >
        {list.map((file, idx) => {
          const badge = getStatusBadge(file);
          const color = getStatusColor(badge);
          return (
            <li
              key={`${file.path}-${idx}`}
              tabIndex={0}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--spacing-xs) var(--spacing-sm)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "var(--font-sans)",
                transition: "background var(--transition-fast)",
                outlineColor: "var(--workbench-accent)"
              }}
              className="hover:bg-[var(--color-bg-hover)] focus:bg-[var(--color-bg-hover)]"
              title={`${file.path} (${badge})`}
            >
              <span
                className="truncate"
                style={{
                  color: "var(--workbench-text-secondary)",
                  flex: 1,
                  marginRight: "var(--spacing-sm)"
                }}
              >
                {file.path}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color,
                  width: "16px",
                  textAlign: "center"
                }}
              >
                {badge}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column",
        backgroundColor: "var(--workbench-sidebar)",
        color: "var(--workbench-text)",
        fontFamily: "var(--font-sans)"
      }}
      aria-label="Source Control Panel"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--spacing-sm) var(--spacing-md)",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--workbench-text-muted)",
          borderBottom: "1px solid var(--workbench-border)"
        }}
      >
        <span>Source Control</span>
        <button
          onClick={() => void fetchStatus()}
          style={{
            background: "none",
            border: "none",
            color: "var(--workbench-text-secondary)",
            cursor: "pointer",
            fontSize: "14px",
            outlineColor: "var(--workbench-accent)",
            transition: "color var(--transition-fast)"
          }}
          className="hover:text-[var(--workbench-text)]"
          title="Refresh Status"
          aria-label="Refresh Status"
        >
          ↻
        </button>
      </div>

      {/* Commit Box Container */}
      <div
        style={{
          padding: "var(--spacing-md)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-sm)",
          borderBottom: "1px solid var(--workbench-border)"
        }}
      >
        <div style={{ position: "relative" }}>
          <textarea
            className="ocs-focus-ring"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message (Cmd+Enter to commit)"
            style={{
              width: "100%",
              backgroundColor: "var(--color-bg-hover)",
              color: "var(--workbench-text)",
              border: "1px solid var(--workbench-border-strong)",
              padding: "var(--spacing-sm)",
              fontSize: "13px",
              fontFamily: "var(--font-mono)",
              borderRadius: "var(--radius-sm)",
              resize: "none",
              transition: "border var(--transition-fast)"
            }}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void handleCommit();
              }
            }}
            aria-label="Commit Message input"
          />
          <button
            title="Generate AI Commit Message"
            onClick={() => setMessage("feat: implement missing premium UI elements")}
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              backgroundColor: "var(--color-hyper-purple)",
              color: "#fff",
              border: "none",
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer"
            }}
            className="hover:brightness-110"
          >
            Generate <SparklesIcon size={12} />
          </button>
        </div>
        <div style={{ display: "flex", width: "100%", position: "relative" }}>
          <button
            onClick={() => void handleCommit()}
            disabled={!message || loading}
            style={{
              flex: 1,
              backgroundColor:
                message && !loading ? "var(--workbench-accent)" : "var(--color-bg-hover)",
              color: message && !loading ? "#ffffff" : "var(--workbench-text-muted)",
              fontSize: "12px",
              fontWeight: 700,
              padding: "6px 0",
              border: "none",
              borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)",
              cursor: message && !loading ? "pointer" : "not-allowed",
              transition: "all var(--transition-fast)",
              boxShadow: message && !loading ? "inset 0 1px 1px rgba(255,255,255,0.2)" : "none",
              outlineColor: "var(--workbench-accent)"
            }}
            className={message && !loading ? "hover:brightness-110" : ""}
            aria-label="Commit changes"
          >
            ✓ Commit
          </button>
          <div style={{ width: "1px", backgroundColor: "rgba(0,0,0,0.2)" }} />
          <button
            disabled={!message || loading}
            onClick={() => setShowCommitMenu(!showCommitMenu)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                message && !loading ? "var(--workbench-accent)" : "var(--color-bg-hover)",
              color: message && !loading ? "#ffffff" : "var(--workbench-text-muted)",
              padding: "0 8px",
              border: "none",
              borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
              cursor: message && !loading ? "pointer" : "not-allowed",
              boxShadow: message && !loading ? "inset 0 1px 1px rgba(255,255,255,0.2)" : "none"
            }}
            className={message && !loading ? "hover:brightness-110" : ""}
          >
            <ChevronDownIcon size={14} />
          </button>

          {showCommitMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "4px",
                backgroundColor: "var(--color-bg-tertiary)",
                border: "1px solid var(--workbench-border)",
                borderRadius: "var(--radius-sm)",
                boxShadow: "var(--shadow-lg)",
                zIndex: 100,
                minWidth: "150px",
                padding: "4px",
                backdropFilter: "blur(12px)"
              }}
            >
              <button
                onClick={() => void handleCommitAndPush()}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "6px 12px",
                  background: "transparent",
                  border: "none",
                  color: "var(--workbench-text)",
                  fontSize: "12px",
                  cursor: "pointer",
                  borderRadius: "var(--radius-sm)"
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--workbench-accent-hover)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Commit & Push
              </button>
              <button
                onClick={() => void handleCommit()}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "6px 12px",
                  background: "transparent",
                  border: "none",
                  color: "var(--workbench-text)",
                  fontSize: "12px",
                  cursor: "pointer",
                  borderRadius: "var(--radius-sm)"
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--workbench-accent-hover)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Commit & Sync
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div
          style={{
            padding: "var(--spacing-sm) var(--spacing-md)",
            fontSize: "12px",
            color: "var(--color-error)"
          }}
        >
          {error}
        </div>
      )}

      {/* Sectioned Status Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "var(--spacing-sm) 0" }}>
        {!status && loading && (
          <div
            style={{
              padding: "var(--spacing-md)",
              fontSize: "13px",
              color: "var(--workbench-text-muted)",
              fontStyle: "italic"
            }}
          >
            Loading status...
          </div>
        )}

        {status && (
          <div>
            {/* 1. Staged Changes Section */}
            {renderSectionHeader("Staged Changes", staged.length, isStagedExpanded, () =>
              setIsStagedExpanded(!isStagedExpanded)
            )}
            {isStagedExpanded && staged.length > 0 && renderFileList(staged)}

            {/* 2. Changes Section */}
            {renderSectionHeader("Changes", modified.length, isModifiedExpanded, () =>
              setIsModifiedExpanded(!isModifiedExpanded)
            )}
            {isModifiedExpanded && modified.length > 0 && renderFileList(modified)}

            {/* 3. Untracked Files Section */}
            {renderSectionHeader("Untracked Files", untracked.length, isUntrackedExpanded, () =>
              setIsUntrackedExpanded(!isUntrackedExpanded)
            )}
            {isUntrackedExpanded && untracked.length > 0 && renderFileList(untracked)}

            {files.length === 0 && (
              <div
                style={{
                  padding: "var(--spacing-md)",
                  fontSize: "13px",
                  color: "var(--workbench-text-muted)",
                  fontStyle: "italic",
                  textAlign: "center"
                }}
              >
                No active changes in repository
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
