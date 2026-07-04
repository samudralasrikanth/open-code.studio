/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import { FileIcon } from "@ocs/ui";

export const SearchSidebar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [isRegex, setIsRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);

  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filesScanned, setFilesScanned] = useState(0);
  const [matchesFound, setMatchesFound] = useState(0);

  const queryIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Listeners for IPC events
    const unsubResult = window.ocs.search.onResultFound((payload) => {
      if (payload.queryId === queryIdRef.current) {
        setResults((prev) => [...prev, payload.result]);
      }
    });

    const unsubProgress = window.ocs.search.onProgress((payload) => {
      if (payload.queryId === queryIdRef.current) {
        setFilesScanned(payload.filesScanned);
        setMatchesFound(payload.matchesFound);
      }
    });

    const unsubCompleted = window.ocs.search.onCompleted((payload) => {
      if (payload.queryId === queryIdRef.current) {
        setIsSearching(false);
        setMatchesFound(payload.totalMatches);
      }
    });

    const unsubCancelled = window.ocs.search.onCancelled((payload) => {
      if (payload.queryId === queryIdRef.current) {
        setIsSearching(false);
      }
    });

    return () => {
      unsubResult();
      unsubProgress();
      unsubCompleted();
      unsubCancelled();
    };
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    if (queryIdRef.current && isSearching) {
      await window.ocs.search.cancel(queryIdRef.current);
    }

    const newQueryId = Math.random().toString(36).substring(7);
    queryIdRef.current = newQueryId;

    setResults([]);
    setFilesScanned(0);
    setMatchesFound(0);
    setIsSearching(true);

    const activeWorkspace = await window.ocs.workspace.getActive();
    const cwd = activeWorkspace ? activeWorkspace.uri : "/";

    await window.ocs.search.start(
      {
        id: newQueryId,
        text: query,
        isRegex,
        matchCase,
        matchWholeWord,
        replaceText
      },
      cwd
    );
  };

  const handleStop = () => {
    if (queryIdRef.current) {
      window.ocs.search.cancel(queryIdRef.current);
      setIsSearching(false);
    }
  };

  const openFile = async (file: string, _line: number, _column: number) => {
    // In a real implementation we would go to the line/column
    await window.ocs.document.open(file);
    await window.ocs.editor.open(file);
  };

  return (
    <div
      style={{
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxSizing: "border-box"
      }}
    >
      <div style={{ marginBottom: "10px" }}>
        <input
          className="ocs-focus-ring"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Search"
          style={{
            width: "100%",
            padding: "5px 8px",
            marginBottom: "5px",
            backgroundColor: "var(--color-bg-hover)",
            color: "var(--workbench-text)",
            border: "1px solid var(--workbench-border-strong)",
            borderRadius: "8px",
            outline: "none",
            transition: "all var(--transition-fast)"
          }}
        />
        <input
          className="ocs-focus-ring"
          type="text"
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          placeholder="Replace"
          style={{
            width: "100%",
            padding: "5px 8px",
            marginBottom: "5px",
            backgroundColor: "var(--color-bg-hover)",
            color: "var(--workbench-text)",
            border: "1px solid var(--workbench-border-strong)",
            borderRadius: "8px",
            outline: "none",
            transition: "all var(--transition-fast)"
          }}
        />
        <div
          style={{
            display: "flex",
            gap: "6px",
            fontSize: "11px",
            marginBottom: "10px",
            fontFamily: "var(--font-mono)",
            fontWeight: 600
          }}
        >
          <button
            onClick={() => setMatchCase(!matchCase)}
            style={{
              padding: "2px 6px",
              borderRadius: "4px",
              border: "1px solid transparent",
              backgroundColor: matchCase ? "var(--workbench-accent-muted)" : "transparent",
              color: matchCase ? "var(--workbench-accent)" : "var(--workbench-text-muted)",
              cursor: "pointer",
              transition: "all var(--transition-fast)"
            }}
            className="hover:bg-[var(--color-bg-hover)]"
            title="Match Case"
          >
            Aa
          </button>
          <button
            onClick={() => setMatchWholeWord(!matchWholeWord)}
            style={{
              padding: "2px 6px",
              borderRadius: "4px",
              border: "1px solid transparent",
              backgroundColor: matchWholeWord ? "var(--workbench-accent-muted)" : "transparent",
              color: matchWholeWord ? "var(--workbench-accent)" : "var(--workbench-text-muted)",
              cursor: "pointer",
              transition: "all var(--transition-fast)"
            }}
            className="hover:bg-[var(--color-bg-hover)]"
            title="Match Whole Word"
          >
            \b
          </button>
          <button
            onClick={() => setIsRegex(!isRegex)}
            style={{
              padding: "2px 6px",
              borderRadius: "4px",
              border: "1px solid transparent",
              backgroundColor: isRegex ? "var(--workbench-accent-muted)" : "transparent",
              color: isRegex ? "var(--workbench-accent)" : "var(--workbench-text-muted)",
              cursor: "pointer",
              transition: "all var(--transition-fast)"
            }}
            className="hover:bg-[var(--color-bg-hover)]"
            title="Use Regular Expression"
          >
            .*
          </button>
        </div>
      </div>

      {isSearching ? (
        <button
          onClick={handleStop}
          style={{ padding: "5px", marginBottom: "10px", cursor: "pointer" }}
        >
          Stop Search
        </button>
      ) : null}

      <div
        style={{
          fontSize: "11px",
          color: "var(--workbench-text-muted)",
          marginBottom: "10px",
          fontFamily: "var(--font-sans)"
        }}
      >
        {matchesFound} matches in {filesScanned} files
      </div>

      <div style={{ flex: 1, overflowY: "auto", fontSize: "13px" }}>
        {results.map((result, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <div
              style={{
                fontWeight: "bold",
                wordBreak: "break-all",
                padding: "4px 0",
                color: "var(--workbench-text)",
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <FileIcon size={14} />
              {result.file}
            </div>
            {result.matches.slice(0, 5).map((m, j) => (
              <div
                key={j}
                style={{
                  cursor: "pointer",
                  color: "var(--workbench-text-secondary)",
                  display: "flex",
                  padding: "2px 0",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px"
                }}
                onClick={() => openFile(result.file, m.lineNumber, m.column)}
                className="hover:bg-[var(--color-bg-hover)]"
              >
                <span
                  style={{
                    minWidth: "30px",
                    color: "var(--workbench-text-muted)",
                    display: "inline-block",
                    textAlign: "right",
                    marginRight: "8px"
                  }}
                >
                  {m.lineNumber}
                </span>
                <span
                  style={{
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flex: 1
                  }}
                >
                  {m.text.trim().length > 0 ? (
                    <span
                      style={{
                        backgroundColor: "rgba(168, 85, 247, 0.2)",
                        padding: "0 2px",
                        borderRadius: "2px",
                        color: "var(--color-hyper-purple)"
                      }}
                    >
                      {m.text}
                    </span>
                  ) : (
                    result.preview.slice(0, 100) + "..."
                  )}
                </span>
              </div>
            ))}
            {result.matches.length > 5 && (
              <div
                style={{
                  color: "var(--workbench-text-muted)",
                  fontStyle: "italic",
                  padding: "2px 0",
                  fontSize: "11px",
                  marginLeft: "38px"
                }}
              >
                + {result.matches.length - 5} more matches
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
