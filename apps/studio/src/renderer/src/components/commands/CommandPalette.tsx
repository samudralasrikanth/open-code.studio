import { useState, useEffect, useRef } from "react";

import {
  searchRendererCommands,
  executeRendererCommand
} from "../../commands/RendererCommandRegistry.js";

const MRU_KEY = "ocs_command_mru";

function getMru(): string[] {
  try {
    const raw = localStorage.getItem(MRU_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function addMru(commandId: string) {
  try {
    const mru = getMru();
    const nextMru = [commandId, ...mru.filter((id) => id !== commandId)].slice(0, 20);
    localStorage.setItem(MRU_KEY, JSON.stringify(nextMru));
  } catch (err) {
    console.warn("Failed to save MRU cache", err);
  }
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UnifiedCommandResult {
  command: {
    id: string;
    title: string;
    category: string;
  };
  highlightedTitle?: string;
  source: "renderer" | "main";
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UnifiedCommandResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      void fetchResults("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) {
          void executeCommand(results[selectedIndex].command.id, results[selectedIndex].source);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const fetchResults = async (searchQuery: string) => {
    try {
      const mainResults = (window as any).ocs?.commands
        ? await (window as any).ocs.commands.search(searchQuery, 20)
        : [];
      const rendererResults = searchRendererCommands(searchQuery, 20);

      const combinedResults = [
        ...rendererResults.map((r: any) => ({
          command: {
            id: r.command.id,
            title: r.command.title,
            category: r.command.category || ""
          },
          highlightedTitle: r.highlightedTitle || r.command.title,
          source: "renderer" as const
        })),
        ...mainResults.map((r: any) => ({
          command: {
            id: r.id,
            title: r.title,
            category: r.category || ""
          },
          highlightedTitle: r.highlightedTitle || r.title,
          source: "main" as const
        }))
      ];

      const seenIds = new Set<string>();
      const deduped: UnifiedCommandResult[] = [];

      for (const item of combinedResults) {
        if (!seenIds.has(item.command.id)) {
          seenIds.add(item.command.id);
          deduped.push(item);
        }
      }

      const mru = getMru();
      deduped.sort((a, b) => {
        const idxA = mru.indexOf(a.command.id);
        const idxB = mru.indexOf(b.command.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });

      setResults(deduped.slice(0, 20));
      setSelectedIndex(0);
    } catch (err) {
      console.error("Failed to search commands:", err);
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    void fetchResults(newQuery);
  };

  const executeCommand = async (commandId: string, source: "renderer" | "main") => {
    addMru(commandId);
    onClose();
    try {
      if (source === "renderer") {
        await executeRendererCommand(commandId);
      } else if (window.ocs?.commands?.execute) {
        await window.ocs.commands.execute(commandId);
      }
    } catch (err) {
      console.error("Command execution failed:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-start pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--workbench-panel)",
          borderColor: "var(--workbench-border)"
        }}
        className="w-[600px] max-w-[90vw] rounded-xl shadow-2xl border overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            borderColor: "var(--workbench-border)"
          }}
          className="flex items-center px-4 py-3 border-b focus-within:ring-2 focus-within:ring-[var(--workbench-accent)] focus-within:ring-offset-0 transition-all duration-150"
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Type a command..."
            style={{
              color: "var(--workbench-text)"
            }}
            className="flex-1 bg-transparent border-none outline-none text-lg"
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div
              style={{ color: "var(--workbench-text-muted)" }}
              className="px-4 py-3 text-sm text-center"
            >
              No matching commands
            </div>
          ) : (
            results.map((result, idx) => (
              <div
                key={result.command.id}
                onClick={() => void executeCommand(result.command.id, result.source)}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{
                  backgroundColor:
                    idx === selectedIndex ? "var(--workbench-accent-hover)" : "transparent",
                  color:
                    idx === selectedIndex
                      ? "var(--workbench-text)"
                      : "var(--workbench-text-secondary)"
                }}
                className="px-4 py-2.5 cursor-pointer flex justify-between items-center transition-colors duration-100"
              >
                <div>
                  <span
                    style={{ color: "var(--workbench-accent)" }}
                    className="text-xs font-bold mr-2 opacity-80 uppercase tracking-wider"
                  >
                    {result.command.category}
                  </span>
                  {getMru().includes(result.command.id) && (
                    <span
                      style={{
                        color: "var(--workbench-text-secondary)",
                        marginLeft: "4px",
                        marginRight: "8px",
                        fontSize: "10px",
                        opacity: 0.8
                      }}
                    >
                      (recently used)
                    </span>
                  )}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: result.highlightedTitle || result.command.title
                    }}
                  />
                </div>
                <div
                  style={{ color: "var(--workbench-text-muted)" }}
                  className="text-[10px] uppercase tracking-[0.18em]"
                >
                  {result.source === "renderer" ? "UI" : "App"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
