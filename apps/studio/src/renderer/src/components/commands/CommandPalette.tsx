import { useState, useEffect, useRef } from "react";

import type { OcsAPI } from "../../../../preload/preload.js";
import {
  searchRendererCommands,
  executeRendererCommand
} from "../../commands/RendererCommandRegistry.js";

declare global {
  interface Window {
    ocs: OcsAPI;
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
      const mainResults = window.ocs?.commands ? await window.ocs.commands.search(searchQuery, 20) : [];
      const rendererResults = searchRendererCommands(searchQuery, 20);

      const merged = [
        ...rendererResults.map((result) => ({
          command: result.command,
          highlightedTitle: result.highlightedTitle || result.command.title,
          source: "renderer" as const
        })),
        ...mainResults.map((result) => ({
          command: result.command,
          highlightedTitle: result.highlightedTitle || result.command.title,
          source: "main" as const
        }))
      ];

      const deduped = merged.reduce<UnifiedCommandResult[]>((acc, item) => {
        if (acc.some((existing) => existing.command.id === item.command.id)) {
          return acc;
        }
        acc.push(item);
        return acc;
      }, []);

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
      className="fixed inset-0 z-50 flex justify-center items-start pt-[15vh] bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[600px] max-w-[90vw] bg-[var(--ocs-color-bg-panel)] rounded-xl shadow-2xl border border-[var(--ocs-color-border)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[var(--ocs-color-border)]">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Type a command..."
            className="flex-1 bg-transparent border-none text-[var(--ocs-color-text)] outline-none text-lg"
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[var(--ocs-color-text-muted)] text-center">
              No matching commands
            </div>
          ) : (
            results.map((result, idx) => (
              <div
                key={result.command.id}
                onClick={() => void executeCommand(result.command.id, result.source)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`px-4 py-2 cursor-pointer flex justify-between items-center ${idx === selectedIndex
                    ? "bg-[var(--ocs-color-bg-active)] text-[var(--ocs-color-text-active)]"
                    : "text-[var(--ocs-color-text)] hover:bg-[var(--ocs-color-bg-hover)]"
                  }`}
              >
                <div>
                  <span className="text-xs font-semibold mr-2 opacity-60 uppercase">
                    {result.command.category}
                  </span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: result.highlightedTitle || result.command.title
                    }}
                  />
                </div>
                <div className="text-[10px] text-[var(--ocs-color-text-muted)] uppercase tracking-[0.18em]">
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
