import React, { useState, useEffect, useRef } from "react";
import type { SearchResult } from "@ocs/search";

export const SearchSidebar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [isRegex, setIsRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);

  const [results, setResults] = useState<SearchResult[]>([]);
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

  const openFile = async (file: string, line: number, column: number) => {
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
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Search"
          style={{ width: "100%", padding: "5px", marginBottom: "5px" }}
        />
        <input
          type="text"
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          placeholder="Replace"
          style={{ width: "100%", padding: "5px", marginBottom: "5px" }}
        />
        <div style={{ display: "flex", gap: "10px", fontSize: "12px", marginBottom: "10px" }}>
          <label>
            <input
              type="checkbox"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
            />{" "}
            Aa
          </label>
          <label>
            <input
              type="checkbox"
              checked={matchWholeWord}
              onChange={(e) => setMatchWholeWord(e.target.checked)}
            />{" "}
            \b
          </label>
          <label>
            <input
              type="checkbox"
              checked={isRegex}
              onChange={(e) => setIsRegex(e.target.checked)}
            />{" "}
            .*
          </label>
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

      <div style={{ fontSize: "11px", color: "#888", marginBottom: "10px" }}>
        {matchesFound} matches in {filesScanned} files
      </div>

      <div style={{ flex: 1, overflowY: "auto", fontSize: "13px" }}>
        {results.map((result, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <div
              style={{
                fontWeight: "bold",
                wordBreak: "break-all",
                paddingBottom: "2px",
                borderBottom: "1px solid #444",
                marginBottom: "2px"
              }}
            >
              {result.file}
            </div>
            {result.matches.slice(0, 5).map((m, j) => (
              <div
                key={j}
                style={{ cursor: "pointer", color: "#aaa", display: "flex", padding: "2px 0" }}
                onClick={() => openFile(result.file, m.lineNumber, m.column)}
              >
                <span style={{ minWidth: "30px", color: "#666", display: "inline-block" }}>
                  {m.lineNumber}
                </span>
                <span
                  style={{ whiteSpace: "pre-wrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {m.text.trim().length > 0 ? m.text : result.preview.slice(0, 100) + "..."}
                </span>
              </div>
            ))}
            {result.matches.length > 5 && (
              <div style={{ color: "#666", fontStyle: "italic", padding: "2px 0" }}>
                + {result.matches.length - 5} more matches
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
