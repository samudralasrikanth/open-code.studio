import { SparklesIcon } from "@ocs/ui";
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface ExtensionData {
  id: string;
  name: string;
  namespace: string;
  displayName: string;
  description: string;
  version: string;
  publisher: string;
  iconUrl?: string;
  downloadCount: number;
  rating: number;
  readme?: string;
}

interface ExtensionEditorViewProps {
  input: { id: string };
}

export const ExtensionEditorView: React.FC<ExtensionEditorViewProps> = ({ input }) => {
  const [details, setDetails] = useState<ExtensionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  const extId = input.id.replace("extension://", "");

  useEffect(() => {
    let mounted = true;

    async function fetchDetails() {
      setLoading(true);
      setError(null);

      try {
        const result = (await window.ocs.extensions.getDetails(extId)) as {
          success: boolean;
          data?: unknown;
          error?: { message: string };
        };
        if (mounted) {
          if (result.success && result.data) {
            setDetails(result.data as ExtensionData);
          } else {
            setError(result.error?.message || "Failed to load extension details");
          }
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error occurred";
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void fetchDetails();

    return () => {
      mounted = false;
    };
  }, [extId]);

  useEffect(() => {
    let mounted = true;
    async function checkInstalled() {
      try {
        const result = (await window.ocs.extensions.isInstalled(extId)) as {
          success: boolean;
          data?: boolean;
        };
        if (mounted && result.success) {
          setInstalled(result.data || false);
        }
      } catch (e) {
        // ignore
      }
    }
    void checkInstalled();
    return () => {
      mounted = false;
    };
  }, [extId]);

  const handleInstall = async () => {
    if (installing || installed) return;
    setInstalling(true);
    try {
      const result = (await window.ocs.extensions.install(extId)) as {
        success: boolean;
        error?: { message: string };
      };
      if (result.success) {
        setInstalled(true);
      } else {
        alert("Installation failed: " + (result.error?.message || "Unknown error"));
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      alert("Installation failed: " + message);
    } finally {
      setInstalling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "var(--spacing-xl)", color: "var(--workbench-text-muted)" }}>
        Loading extension details...
      </div>
    );
  }

  if (error || !details) {
    return (
      <div style={{ padding: "var(--spacing-xl)", color: "var(--color-deleted)" }}>
        Error: {error || "Extension not found"}
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        backgroundColor: "var(--workbench-bg)",
        color: "var(--workbench-text)",
        padding: "32px 48px"
      }}
    >
      {/* Header section */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "32px" }}>
        {/* Icon */}
        <div
          style={{
            width: "128px",
            height: "128px",
            borderRadius: "16px",
            backgroundColor: "var(--color-bg-tertiary)",
            flexShrink: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {details.iconUrl ? (
            <img
              src={details.iconUrl}
              alt={details.displayName}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <SparklesIcon size={64} color="var(--workbench-text-muted)" />
          )}
        </div>

        {/* Title and stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: 0
          }}
        >
          <h1
            style={{
              margin: "0 0 8px 0",
              fontSize: "28px",
              fontWeight: 600,
              color: "var(--workbench-text)"
            }}
          >
            {details.displayName}
          </h1>
          <div
            style={{
              display: "flex",
              gap: "16px",
              fontSize: "13px",
              color: "var(--workbench-text-muted)",
              marginBottom: "16px",
              alignItems: "center"
            }}
          >
            <span style={{ color: "var(--workbench-accent)" }}>{details.publisher}</span>
            <span>|</span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M14.25 10.74V13.5H1.75v-2.76H.25v3.5h15.5v-3.5h-1.5zM10.8 7.37L8.75 9.42V1.5H7.25v7.92L5.2 7.37l-1.06 1.06 3.86 3.86 3.86-3.86-1.06-1.06z"
                />
              </svg>
              {details.downloadCount.toLocaleString()}
            </span>
            {details.rating > 0 && (
              <>
                <span>|</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    color="#e8a825"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8 12.3l-4.14 2.5 1.1-4.72L1.24 6.8l4.84-.4L8 2l1.92 4.4 4.84.4-3.72 3.28 1.1 4.72L8 12.3z"
                    />
                  </svg>
                  {details.rating.toFixed(1)}
                </span>
              </>
            )}
          </div>

          <p
            style={{
              margin: "0 0 16px 0",
              fontSize: "14px",
              color: "var(--workbench-text)",
              lineHeight: 1.5
            }}
          >
            {details.description}
          </p>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => {
                void handleInstall();
              }}
              disabled={installing || installed}
              style={{
                backgroundColor: installed ? "var(--color-bg-tertiary)" : "#007acc",
                color: installed ? "var(--workbench-text-muted)" : "#fff",
                border: installed ? "1px solid var(--workbench-border)" : "none",
                padding: "6px 20px",
                borderRadius: "2px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: installing || installed ? "default" : "pointer",
                opacity: installing ? 0.7 : 1
              }}
            >
              {installed ? "Installed" : installing ? "Installing..." : "Install"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          borderBottom: "1px solid var(--workbench-border)",
          display: "flex",
          gap: "24px",
          marginBottom: "24px"
        }}
      >
        {["DETAILS", "FEATURES", "CHANGELOG"].map((tab, i) => (
          <div
            key={tab}
            style={{
              padding: "8px 0",
              fontSize: "12px",
              fontWeight: 600,
              color: i === 0 ? "var(--workbench-text)" : "var(--workbench-text-muted)",
              borderBottom: i === 0 ? "1px solid var(--workbench-accent)" : "none",
              cursor: "pointer"
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, fontSize: "14px", lineHeight: 1.6, color: "var(--workbench-text)" }}>
        {details.readme ? (
          <div className="markdown-body" style={{ padding: "0 0 32px 0" }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {details.readme}
            </ReactMarkdown>
          </div>
        ) : (
          <p style={{ color: "var(--workbench-text-muted)" }}>
            This extension's README is not available.
          </p>
        )}
      </div>
    </div>
  );
};
