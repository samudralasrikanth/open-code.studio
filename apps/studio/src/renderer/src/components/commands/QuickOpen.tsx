import { useState, useEffect, useRef, useMemo } from "react";

// Let's reimplement fuzzyScore locally if not exported
function quickFuzzyScore(query: string, target: string): number {
  if (!query) return 100;
  const t = target.toLowerCase();
  const q = query.toLowerCase();

  let score = 0;
  let qIdx = 0;

  for (let i = 0; i < t.length; i++) {
    if (t[i] === q[qIdx]) {
      score += 10;
      if (i > 0 && t[i - 1] === "/") score += 5; // boost path segments
      qIdx++;
      if (qIdx === q.length) break;
    }
  }

  if (qIdx < q.length) return -1;
  return score - t.length * 0.1; // slight penalty for long paths
}

interface QuickOpenProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickOpen({ isOpen, onClose }: QuickOpenProps) {
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      void (async () => {
        if (window.ocs?.workspace?.getAllFiles) {
          try {
            const list = await window.ocs.workspace.getAllFiles();
            setFiles(list);
          } catch (e) {
            console.error("Failed to get all files", e);
          }
        }
      })();
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query) {
      return files.slice(0, 20);
    }

    return files
      .map((file) => ({ file, score: quickFuzzyScore(query, file) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.file)
      .slice(0, 20);
  }, [files, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            void execute(results[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, results, selectedIndex, onClose]);

  useEffect(() => {
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const execute = async (filePath: string) => {
    onClose();
    if (window.ocs?.document?.open) {
      try {
        const workspace = await window.ocs.workspace.getActive();
        if (workspace) {
          const sep = filePath.includes("\\") ? "\\" : "/";
          const uri = workspace.uri + (workspace.uri.endsWith(sep) ? "" : sep) + filePath;
          await window.ocs.document.open(uri);
        }
      } catch (e) {
        console.error("Failed to open file", e);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "15vh",
        zIndex: 99999
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(2px)"
        }}
        onClick={onClose}
      />

      <div
        style={{
          position: "relative",
          width: "600px",
          maxWidth: "90vw",
          backgroundColor: "var(--workbench-panel)",
          borderRadius: "8px",
          boxShadow: "var(--workbench-shadow-xl)",
          border: "1px solid var(--workbench-border)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "ocs-slide-down 0.15s ease-out forwards"
        }}
      >
        <div style={{ padding: "12px", borderBottom: "1px solid var(--workbench-border)" }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files by name..."
            style={{
              width: "100%",
              padding: "8px 12px",
              backgroundColor: "var(--workbench-background)",
              color: "var(--workbench-text)",
              border: "1px solid var(--workbench-border)",
              borderRadius: "4px",
              outline: "none",
              fontSize: "14px"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--workbench-accent)";
              e.target.style.boxShadow = "var(--workbench-focus-ring)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--workbench-border)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {results.length > 0 && (
          <div ref={scrollRef} style={{ maxHeight: "400px", overflowY: "auto", padding: "6px" }}>
            {results.map((file, index) => {
              const isSelected = index === selectedIndex;
              const name = file.split(/[/\\]/).pop() || file;
              const dir = file.substring(0, file.length - name.length);

              return (
                <div
                  key={file}
                  onClick={() => {
                    void execute(file);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "4px",
                    backgroundColor: isSelected ? "var(--workbench-accent)" : "transparent",
                    color: isSelected ? "#ffffff" : "var(--workbench-text)",
                    marginBottom: "2px"
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: isSelected ? 500 : 400 }}>
                    {name}
                  </span>
                  {dir && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "12px",
                        opacity: isSelected ? 0.9 : 0.5
                      }}
                    >
                      {dir}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {results.length === 0 && (
          <div style={{ padding: "24px", textAlign: "center", opacity: 0.5, fontSize: "13px" }}>
            No matching files found
          </div>
        )}
      </div>
    </div>
  );
}
