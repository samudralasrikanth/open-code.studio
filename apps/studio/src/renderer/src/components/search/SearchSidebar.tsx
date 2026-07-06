/* eslint-disable */
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { FileIcon, ChevronDownIcon, CloseIcon, Button, IconButton } from "@ocs/ui";

function useSearchKeyboard(itemCount: number, onSelect: (index: number) => void) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (itemCount === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        onSelect(selectedIndex);
      }
    },
    [itemCount, selectedIndex, onSelect]
  );

  return { selectedIndex, setSelectedIndex, handleKeyDown };
}

export const SearchSidebar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [isRegex, setIsRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);

  const [showReplace, setShowReplace] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [includePatterns, setIncludePatterns] = useState("");
  const [excludePatterns, setExcludePatterns] = useState("");

  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filesScanned, setFilesScanned] = useState(0);
  const [matchesFound, setMatchesFound] = useState(0);
  const [isReplacing, setIsReplacing] = useState(false);

  const queryIdRef = useRef<string | null>(null);
  const scrollParentRef = useRef<HTMLDivElement>(null);

  const flatItems = useMemo(() => {
    const items: any[] = [];
    for (const result of results) {
      items.push({ type: "file", result });
      for (const match of result.matches) {
        items.push({ type: "match", result, match });
      }
    }
    return items;
  }, [results]);

  const virtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 24,
    overscan: 20
  });

  const { selectedIndex, setSelectedIndex, handleKeyDown } = useSearchKeyboard(
    flatItems.length,
    (index) => {
      const item = flatItems[index];
      if (item.type === "match") {
        openFile(item.result.file, item.match.lineNumber, item.match.column, item.match.length);
      }
    }
  );

  // Scroll to selected item when it changes via keyboard
  useEffect(() => {
    if (selectedIndex >= 0) {
      virtualizer.scrollToIndex(selectedIndex, { align: "auto" });
    }
  }, [selectedIndex, virtualizer]);

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
        replaceText,
        includePatterns: includePatterns
          ? includePatterns
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        excludePatterns: excludePatterns
          ? excludePatterns
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined
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

  const openFile = async (file: string, line: number, column: number, length: number) => {
    await window.ocs.document.open(file);
    await window.ocs.editor.open(file, {
      selection: {
        startLineNumber: line,
        startColumn: column,
        endLineNumber: line,
        endColumn: column + length
      },
      active: true,
      preview: true
    });
  };

  const handleReplaceFile = async (fileResult: any) => {
    if (!queryIdRef.current) return;
    setIsReplacing(true);
    try {
      await window.ocs.search.replaceInFile({
        queryId: queryIdRef.current,
        file: fileResult.file,
        replaceText
      });

      // Remove the file from the results
      setResults((prev) => prev.filter((r) => r.file !== fileResult.file));
      setMatchesFound((prev) => prev - fileResult.matches.length);
    } catch (e) {
      console.error("Failed to replace in file", e);
    } finally {
      setIsReplacing(false);
    }
  };

  const handleReplaceNext = async () => {
    if (!queryIdRef.current || results.length === 0) return;
    setIsReplacing(true);
    try {
      const firstResultIndex = results.findIndex((r) => r.matches && r.matches.length > 0);
      if (firstResultIndex >= 0) {
        const firstResult = results[firstResultIndex];

        await window.ocs.search.replaceMatch({
          queryId: queryIdRef.current,
          file: firstResult.file,
          matchIndex: 0,
          replaceText
        });

        setResults((prev) => {
          const newResults = [...prev];
          const newResult = { ...newResults[firstResultIndex] };
          newResult.matches = [...newResult.matches.slice(1)];
          if (newResult.matches.length === 0) {
            newResults.splice(firstResultIndex, 1);
          } else {
            newResults[firstResultIndex] = newResult;
          }
          return newResults;
        });
        setMatchesFound((prev) => prev - 1);
      }
    } catch (e) {
      console.error("Failed to replace next", e);
    } finally {
      setIsReplacing(false);
    }
  };

  const handleReplaceAll = async () => {
    if (!queryIdRef.current || results.length === 0) return;
    setIsReplacing(true);
    try {
      await window.ocs.search.replaceAll({
        queryId: queryIdRef.current,
        replaceText: replaceText
      });
      // Re-run search to get fresh results
      await handleSearch();
    } catch (e) {
      console.error("Failed to replace all", e);
    } finally {
      setIsReplacing(false);
    }
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
        {/* Search Input Row */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "5px" }}>
          <IconButton
            onClick={() => setShowReplace(!showReplace)}
            style={{ padding: 0 }}
            title="Toggle Replace"
          >
            <div
              style={{
                transform: showReplace ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.1s"
              }}
            >
              <ChevronDownIcon size={16} />
            </div>
          </IconButton>
          <div style={{ position: "relative", flex: 1 }}>
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
                padding: "5px 60px 5px 8px", // space for buttons
                backgroundColor: "var(--color-bg-hover)",
                color: "var(--workbench-text)",
                border: "1px solid var(--workbench-border-strong)",
                borderRadius: "4px",
                outline: "none",
                transition: "all var(--transition-fast)"
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "4px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                gap: "2px"
              }}
            >
              <IconButton
                active={matchCase}
                onClick={() => setMatchCase(!matchCase)}
                title="Match Case"
                style={{ padding: "2px 4px", fontSize: "11px", fontWeight: "bold" }}
              >
                Aa
              </IconButton>
              <IconButton
                active={matchWholeWord}
                onClick={() => setMatchWholeWord(!matchWholeWord)}
                title="Match Whole Word"
                style={{ padding: "2px 4px", fontSize: "11px", fontWeight: "bold" }}
              >
                \b
              </IconButton>
              <IconButton
                active={isRegex}
                onClick={() => setIsRegex(!isRegex)}
                title="Use Regular Expression"
                style={{ padding: "2px 4px", fontSize: "11px", fontWeight: "bold" }}
              >
                .*
              </IconButton>
            </div>
          </div>
        </div>

        {/* Replace Input Row */}
        {showReplace && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "5px" }}>
            <div style={{ width: "16px", flexShrink: 0 }} />
            <div style={{ display: "flex", flex: 1, gap: "4px" }}>
              <input
                className="ocs-focus-ring"
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace"
                style={{
                  flex: 1,
                  padding: "5px 8px",
                  backgroundColor: "var(--color-bg-hover)",
                  color: "var(--workbench-text)",
                  border: "1px solid var(--workbench-border-strong)",
                  borderRadius: "4px",
                  outline: "none",
                  transition: "all var(--transition-fast)"
                }}
              />
              <Button
                disabled={!queryIdRef.current || results.length === 0 || isReplacing}
                onClick={handleReplaceNext}
                title="Replace Next"
                style={{ padding: "4px 8px" }}
              >
                Replace
              </Button>
              <Button
                disabled={!queryIdRef.current || results.length === 0 || isReplacing}
                onClick={handleReplaceAll}
                title="Replace All"
                style={{ padding: "4px 8px" }}
              >
                All
              </Button>
            </div>
          </div>
        )}

        {/* Filters Toggle */}
        <div style={{ marginLeft: "20px", display: "flex", alignItems: "center", gap: "4px" }}>
          <IconButton
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle Search Details"
            style={{ fontSize: "12px", color: "var(--workbench-text-muted)" }}
          >
            ...
          </IconButton>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div
            style={{
              marginLeft: "20px",
              marginTop: "5px",
              display: "flex",
              flexDirection: "column",
              gap: "5px"
            }}
          >
            <div style={{ fontSize: "11px", color: "var(--workbench-text-muted)" }}>
              files to include
            </div>
            <input
              className="ocs-focus-ring"
              type="text"
              value={includePatterns}
              onChange={(e) => setIncludePatterns(e.target.value)}
              placeholder="e.g. *.ts, src/**/include"
              style={{
                width: "100%",
                padding: "4px 6px",
                backgroundColor: "var(--color-bg-hover)",
                color: "var(--workbench-text)",
                border: "1px solid var(--workbench-border-strong)",
                borderRadius: "4px",
                outline: "none",
                fontSize: "12px"
              }}
            />
            <div style={{ fontSize: "11px", color: "var(--workbench-text-muted)" }}>
              files to exclude
            </div>
            <input
              className="ocs-focus-ring"
              type="text"
              value={excludePatterns}
              onChange={(e) => setExcludePatterns(e.target.value)}
              placeholder="e.g. *.js, node_modules"
              style={{
                width: "100%",
                padding: "4px 6px",
                backgroundColor: "var(--color-bg-hover)",
                color: "var(--workbench-text)",
                border: "1px solid var(--workbench-border-strong)",
                borderRadius: "4px",
                outline: "none",
                fontSize: "12px"
              }}
            />
          </div>
        )}
      </div>

      {isSearching ? (
        <Button onClick={handleStop} style={{ marginBottom: "10px" }} variant="secondary">
          Stop Search
        </Button>
      ) : null}

      <div
        style={{
          fontSize: "11px",
          color: "var(--workbench-text-muted)",
          marginBottom: "10px",
          fontFamily: "var(--font-sans)"
        }}
      >
        {isSearching
          ? `Scanning... (${filesScanned} files scanned)`
          : `${matchesFound} matches in ${results.length} files`}
      </div>

      <div
        ref={scrollParentRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{ flex: 1, overflowY: "auto", fontSize: "13px", outline: "none" }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative"
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = flatItems[virtualItem.index];
            const isSelected = selectedIndex === virtualItem.index;

            return (
              <div
                key={virtualItem.key}
                ref={virtualizer.measureElement}
                data-index={virtualItem.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                  backgroundColor: isSelected ? "var(--color-bg-hover)" : "transparent"
                }}
              >
                {item.type === "file" ? (
                  <div
                    style={{
                      fontWeight: "bold",
                      wordBreak: "break-all",
                      padding: "4px 8px",
                      color: "var(--workbench-text)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "6px",
                      cursor: "pointer"
                    }}
                    onClick={() => setSelectedIndex(virtualItem.index)}
                    className="group"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <FileIcon size={14} />
                      {item.result.file}
                    </div>
                    {showReplace && (
                      <IconButton
                        title="Replace in File"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReplaceFile(item.result);
                        }}
                        style={{ opacity: 0.6, padding: "2px" }}
                        className="hover:opacity-100"
                      >
                        <CloseIcon size={12} style={{ transform: "rotate(45deg)" }} />
                      </IconButton>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      cursor: "pointer",
                      color: "var(--workbench-text-secondary)",
                      display: "flex",
                      padding: "2px 8px 2px 32px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px"
                    }}
                    onClick={() => {
                      setSelectedIndex(virtualItem.index);
                      openFile(
                        item.result.file,
                        item.match.lineNumber,
                        item.match.column,
                        item.match.length
                      );
                    }}
                    className={!isSelected ? "hover:bg-[var(--color-bg-hover)]" : ""}
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
                      {item.match.lineNumber}
                    </span>
                    <span
                      style={{
                        whiteSpace: "pre-wrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        flex: 1
                      }}
                    >
                      {item.match.text.trim().length > 0 ? (
                        <span
                          style={{
                            backgroundColor: "rgba(168, 85, 247, 0.2)",
                            padding: "0 2px",
                            borderRadius: "2px",
                            color: "var(--color-hyper-purple)"
                          }}
                        >
                          {item.match.text}
                        </span>
                      ) : (
                        item.result.preview.slice(0, 100) + "..."
                      )}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
