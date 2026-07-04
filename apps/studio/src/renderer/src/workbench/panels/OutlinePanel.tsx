import React, { useEffect, useState } from "react";

import { useEditor } from "../../hooks/useEditor.js";

interface OutlineSymbol {
  name: string;
  kind: "class" | "interface" | "function" | "const" | "type";
  line: number;
}

export const OutlinePanel: React.FC = () => {
  const { editorState } = useEditor();
  const [symbols, setSymbols] = useState<OutlineSymbol[]>([]);
  const [loading, setLoading] = useState(false);

  const activeGroup = editorState?.groups?.find((g) => g.id === editorState.activeGroup);
  const activeInput = activeGroup?.activeInput;

  useEffect(() => {
    let mounted = true;

    const parseContent = (content: string) => {
      const parsedSymbols: OutlineSymbol[] = [];
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        // Very basic regex matching for JS/TS
        const classMatch = line.match(/^\s*(?:export\s+)?(?:default\s+)?class\s+([a-zA-Z0-9_]+)/);
        if (classMatch) {
          parsedSymbols.push({ name: classMatch[1], kind: "class", line: index + 1 });
          return;
        }

        const interfaceMatch = line.match(/^\s*(?:export\s+)?interface\s+([a-zA-Z0-9_]+)/);
        if (interfaceMatch) {
          parsedSymbols.push({ name: interfaceMatch[1], kind: "interface", line: index + 1 });
          return;
        }

        const functionMatch = line.match(
          /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)/
        );
        if (functionMatch) {
          parsedSymbols.push({ name: functionMatch[1], kind: "function", line: index + 1 });
          return;
        }

        const constMatch = line.match(/^\s*(?:export\s+)?const\s+([a-zA-Z0-9_]+)\s*=/);
        if (constMatch) {
          parsedSymbols.push({ name: constMatch[1], kind: "const", line: index + 1 });
          return;
        }

        const typeMatch = line.match(/^\s*(?:export\s+)?type\s+([a-zA-Z0-9_]+)\s*=/);
        if (typeMatch) {
          parsedSymbols.push({ name: typeMatch[1], kind: "type", line: index + 1 });
          return;
        }
      });

      return parsedSymbols;
    };

    const fetchOutline = async () => {
      if (!activeInput) {
        if (mounted) setSymbols([]);
        return;
      }

      try {
        setLoading(true);
        if (window.ocs?.document?.get) {
          const doc = (await window.ocs.document.get(activeInput)) as
            { content?: string } | null | undefined;
          if (mounted && doc?.content) {
            setSymbols(parseContent(doc.content));
          }
        }
      } catch (e) {
        console.error("Failed to parse outline", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchOutline();

    const cleanup = window.ocs?.document?.onStateChanged
      ? window.ocs.document.onStateChanged((payload: unknown) => {
          const uri = (payload as { uri?: string })?.uri;
          if (uri === activeInput && mounted) {
            void fetchOutline();
          }
        })
      : undefined;

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, [activeInput]);

  if (!activeInput) {
    return (
      <div style={{ padding: "8px", color: "var(--workbench-text-muted)" }}>
        No active editor to provide outline.
      </div>
    );
  }

  if (loading && symbols.length === 0) {
    return (
      <div style={{ padding: "8px", color: "var(--workbench-text-muted)" }}>Loading outline...</div>
    );
  }

  if (symbols.length === 0) {
    return (
      <div style={{ padding: "8px", color: "var(--workbench-text-muted)" }}>
        No symbols found in document.
      </div>
    );
  }

  const getIconColor = (kind: string) => {
    switch (kind) {
      case "class":
        return "#d7ba7d"; // Yellow
      case "interface":
        return "#4ec9b0"; // Teal
      case "function":
        return "#c586c0"; // Purple
      case "const":
        return "#9cdcfe"; // Light blue
      case "type":
        return "#4ec9b0"; // Teal
      default:
        return "var(--workbench-text)";
    }
  };

  const getIconText = (kind: string) => {
    switch (kind) {
      case "class":
        return "C";
      case "interface":
        return "I";
      case "function":
        return "ƒ";
      case "const":
        return "[ ]";
      case "type":
        return "T";
      default:
        return "";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
      {symbols.map((symbol, idx) => (
        <div
          key={`${symbol.name}-${idx}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 8px",
            cursor: "pointer",
            fontSize: "13px",
            color: "var(--workbench-text)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          onClick={() => {
            // Future enhancement: scroll editor to line
            // We'd need an IPC event to scroll the editor
          }}
        >
          <span
            style={{
              color: getIconColor(symbol.kind),
              display: "inline-block",
              width: "14px",
              textAlign: "center",
              fontWeight: "bold"
            }}
          >
            {getIconText(symbol.kind)}
          </span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {symbol.name}
          </span>
        </div>
      ))}
    </div>
  );
};
