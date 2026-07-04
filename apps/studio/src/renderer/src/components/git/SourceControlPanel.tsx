import type { GitStatus } from "@ocs/git";
import React, { useEffect, useState } from "react";

interface OcsAPI {
  git: {
    status: () => Promise<GitStatus>;
    commit: (message: string) => Promise<void>;
    pull: () => Promise<void>;
    push: () => Promise<void>;
  };
}
declare global {
  interface Window {
    ocs: OcsAPI;
  }
}

export const SourceControlPanel: React.FC = () => {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    // Floating promise
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

  return (
    <div className="flex h-full w-full flex-col bg-[var(--ocs-panel-bg,#252526)] text-[var(--ocs-text,#cccccc)]">
      {/* Header */}
      <div className="flex items-center justify-between p-2 uppercase text-xs font-bold text-[var(--ocs-text-muted,#858585)] tracking-wider">
        <span>Source Control</span>
        <button
          onClick={() => void fetchStatus()}
          className="cursor-pointer hover:text-[var(--ocs-text)]"
          title="Refresh"
        >
          ↻
        </button>
      </div>

      {/* Commit Box */}
      <div className="p-2 flex flex-col gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message (Cmd+Enter to commit)"
          className="w-full bg-[var(--ocs-input-bg,#3c3c3c)] text-[var(--ocs-text)] border border-[var(--ocs-border,#454545)] p-1 text-sm rounded resize-none"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void handleCommit();
            }
          }}
        />
        <button
          onClick={() => void handleCommit()}
          disabled={!message || loading}
          className="w-full bg-[var(--ocs-button-bg,#0e639c)] hover:bg-[var(--ocs-button-hover,#1177bb)] text-white text-sm py-1 rounded disabled:opacity-50 cursor-pointer"
        >
          Commit
        </button>
      </div>

      {/* Error */}
      {error && <div className="p-2 text-xs text-[var(--ocs-error,#f48771)]">{error}</div>}

      {/* Status */}
      <div className="flex-1 overflow-auto">
        {!status && loading && (
          <div className="p-2 text-sm text-[var(--ocs-text-muted)]">Loading...</div>
        )}
        {status && (
          <div className="p-2">
            <div className="text-xs text-[var(--ocs-text-muted)] mb-2 uppercase font-bold tracking-wider flex items-center justify-between">
              <span>Changes ({status.files.length})</span>
              {status.branch && <span>{status.branch}</span>}
            </div>

            <ul className="flex flex-col gap-[2px]">
              {status.files.map((file, idx) => {
                const isUntracked = file.workTreeStatus === "?";
                const isDeleted = file.workTreeStatus === "D" || file.indexStatus === "D";
                const color = isUntracked
                  ? "text-[var(--ocs-git-untracked,#73c991)]"
                  : isDeleted
                    ? "text-[var(--ocs-error,#f48771)]"
                    : "text-[var(--ocs-git-modified,#e2c08d)]";

                const badge = isUntracked ? "U" : isDeleted ? "D" : "M";

                return (
                  <li
                    key={`${file.path}-${idx}`}
                    className="flex items-center justify-between group px-1 py-[2px] cursor-pointer hover:bg-[var(--ocs-list-hover,#2a2d2e)] text-sm"
                  >
                    <span className={`truncate ${color}`} title={file.path}>
                      {file.path}
                    </span>
                    <span
                      className={`text-[10px] ${color} font-bold opacity-80 group-hover:opacity-100`}
                    >
                      {badge}
                    </span>
                  </li>
                );
              })}
            </ul>
            {status.files.length === 0 && (
              <div className="text-sm text-[var(--ocs-text-muted)] italic">No changes</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
