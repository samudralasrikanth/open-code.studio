import React, { useEffect, useState } from "react";
import { useWorkspace } from "../../hooks/useWorkspace.js";

interface NpmScriptsPanelProps {
  onRunScript: (scriptName: string) => void;
}

export const NpmScriptsPanel: React.FC<NpmScriptsPanelProps> = ({ onRunScript }) => {
  const { getActive } = useWorkspace();
  const [scripts, setScripts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchScripts = async () => {
      try {
        setLoading(true);
        const ws = await getActive();
        if (!ws) return;

        const packageJsonUri = `${ws.uri}/package.json`;
        if (window.ocs?.document?.get) {
          const doc = await window.ocs.document.get(packageJsonUri);
          if (doc && doc.content) {
            const parsed = JSON.parse(doc.content);
            if (parsed.scripts) {
              if (mounted) {
                setScripts(Object.keys(parsed.scripts));
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch NPM scripts", e);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    void fetchScripts();
    return () => {
      mounted = false;
    };
  }, [getActive]);

  if (loading) {
    return <div>Loading scripts...</div>;
  }

  if (scripts.length === 0) {
    return <div>No scripts found.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {scripts.map((script) => (
        <div
          key={script}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px",
            cursor: "pointer",
            borderRadius: "3px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
            const btn = e.currentTarget.querySelector(".run-btn") as HTMLElement;
            if (btn) btn.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            const btn = e.currentTarget.querySelector(".run-btn") as HTMLElement;
            if (btn) btn.style.opacity = "0";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="var(--workbench-accent)">
              <path d="M14 8L4 14V2l10 6z" />
            </svg>
            <span
              style={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                fontSize: "12px",
                color: "var(--workbench-text)"
              }}
            >
              {script}
            </span>
          </div>
          <div
            className="run-btn"
            style={{ opacity: 0, transition: "opacity 0.1s" }}
            title={`Run ${script}`}
            onClick={(e) => {
              e.stopPropagation();
              onRunScript(script);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM2.5 8a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0zm7.65 0L5.5 4.79v6.42L10.15 8z" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};
