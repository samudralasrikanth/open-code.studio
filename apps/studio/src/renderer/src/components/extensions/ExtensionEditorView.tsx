import type { ExtensionManifest } from "@ocs/extensions";
import { SparklesIcon, SettingsIcon } from "@ocs/ui";
import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { InstallButton } from "./ExtensionsPanel.js";
import { InstalledExtensionDetails } from "./InstalledExtensionDetails.js";

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
  averageRating: number;
  readme?: string;
  installed?: boolean;
  enabled?: boolean;
  manifest?: ExtensionManifest;
}

export function ExtensionEditorView({ input }: { input: { id: string } }) {
  const [details, setDetails] = useState<ExtensionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("DETAILS");

  // Menu states
  const [settingsMenuPos, setSettingsMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Version Picker State
  const [versionPickerState, setVersionPickerState] = useState<{
    type: "install" | "download";
    versions: string[];
  } | null>(null);

  const extId = input.id.replace("extension://", "");

  const loadDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.ocs.extensions.getDetails(extId);
      if (result.success && result.data) {
        setDetails(result.data as ExtensionData);
      } else {
        const err = result as { error?: { message: string } };
        setError(err.error?.message || "Failed to load extension details");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [extId]);

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setSettingsMenuPos(null);
      }
    };
    if (settingsMenuPos) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsMenuPos]);

  if (loading && !details) {
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

  const handleContextMenuClick = async (action: string) => {
    setSettingsMenuPos(null);
    const extId = details.id;

    switch (action) {
      case "Copy": {
        const text = `${details.displayName}\n${details.description}\nID: ${extId}\nVersion: ${details.version}`;
        await navigator.clipboard.writeText(text);
        break;
      }
      case "Copy Extension ID": {
        await navigator.clipboard.writeText(extId);
        break;
      }
      case "Copy Link": {
        await navigator.clipboard.writeText(
          `https://open-vsx.org/extension/${details.namespace}/${details.name}`
        );
        break;
      }
      case "Add to Workspace Recommendations": {
        if (window.ocs.workspace?.addExtensionRecommendation) {
          await window.ocs.workspace.addExtensionRecommendation(extId);
        } else {
          console.warn("Workspace IPC not fully wired up for recommendations yet.");
        }
        break;
      }
      case "Download VSIX": {
        await window.ocs.extensions.downloadVSIX(extId);
        break;
      }
      case "Install Specific Version...":
      case "Download Specific Version VSIX...": {
        const result = await window.ocs.extensions.getVersions(extId);
        if (result.success && result.data && result.data.length > 0) {
          setVersionPickerState({
            type: action.includes("Install") ? "install" : "download",
            versions: result.data
          });
        } else {
          console.warn("Failed to fetch versions or no versions available.");
        }
        break;
      }
    }
  };

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
            {details.averageRating > 0 && (
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
                  {(details.averageRating ?? 0).toFixed(1)}
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

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              marginBottom: "20px",
              position: "relative"
            }}
          >
            <InstallButton
              extId={details.id}
              initialInstalled={details.installed}
              initialEnabled={details.enabled ?? true}
            />

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "var(--workbench-text)",
                cursor: "pointer"
              }}
            >
              <input type="checkbox" defaultChecked /> Auto Update
            </label>

            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setSettingsMenuPos({ x: rect.left, y: rect.bottom + 4 });
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--workbench-text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px",
                borderRadius: "4px"
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--workbench-hover)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <SettingsIcon size={14} />
            </button>

            {settingsMenuPos && (
              <div
                ref={menuRef}
                style={{
                  position: "fixed",
                  top: settingsMenuPos.y,
                  left: settingsMenuPos.x,
                  zIndex: 10000,
                  backgroundColor: "#252526",
                  border: "1px solid #454545",
                  borderRadius: "4px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  minWidth: "220px",
                  padding: "4px 0",
                  fontSize: "13px"
                }}
              >
                {[
                  { label: "Install Specific Version..." },
                  { separator: true },
                  { label: "Copy" },
                  { label: "Copy Extension ID" },
                  { label: "Copy Link" },
                  { separator: true },
                  { label: "Add to Workspace Recommendations" },
                  { separator: true },
                  { label: "Download VSIX" },
                  { label: "Download Specific Version VSIX..." }
                ].map((item, index) =>
                  item.separator ? (
                    <div
                      key={`sep-${index}`}
                      style={{ height: "1px", backgroundColor: "#454545", margin: "4px 0" }}
                    />
                  ) : (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => void handleContextMenuClick(item.label!)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        padding: "6px 12px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        color: "#ccc",
                        cursor: "pointer",
                        fontSize: "13px"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#094771")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {item.label}
                    </button>
                  )
                )}
              </div>
            )}
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
        {["DETAILS", "FEATURES", "CHANGELOG"].map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 0",
              fontSize: "12px",
              fontWeight: 600,
              color: activeTab === tab ? "var(--workbench-text)" : "var(--workbench-text-muted)",
              borderBottom: activeTab === tab ? "1px solid var(--workbench-accent)" : "none",
              cursor: "pointer"
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, fontSize: "14px", lineHeight: 1.6, color: "var(--workbench-text)" }}>
        {details.installed && details.manifest && (
          <div style={{ paddingBottom: "24px" }}>
            <InstalledExtensionDetails
              extension={{
                id: details.id,
                name: details.name,
                publisher: details.publisher,
                version: details.version,
                path: "",
                enabled: details.enabled ?? true,
                installedAt: 0,
                manifest: details.manifest
              }}
            />
          </div>
        )}
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

      {/* Version Picker Modal */}
      {versionPickerState && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setVersionPickerState(null)}
        >
          <div
            style={{
              backgroundColor: "var(--workbench-bg)",
              border: "1px solid var(--workbench-border)",
              borderRadius: "6px",
              width: "400px",
              padding: "20px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 600 }}>
              Select Version to {versionPickerState.type === "install" ? "Install" : "Download"}
            </h2>
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid var(--workbench-border)",
                borderRadius: "4px"
              }}
            >
              {versionPickerState.versions.map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    void (async () => {
                      const extId = details.id;
                      const type = versionPickerState.type;
                      setVersionPickerState(null);

                      if (type === "install") {
                        await window.ocs.extensions.install(extId, v);
                        await loadDetails(); // refresh
                      } else {
                        await window.ocs.extensions.downloadVSIX(extId, v);
                      }
                    })();
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 12px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid var(--workbench-border)",
                    color: "var(--workbench-text)",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--workbench-hover)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {v}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button
                onClick={() => setVersionPickerState(null)}
                style={{
                  padding: "6px 12px",
                  background: "var(--workbench-bg)",
                  color: "var(--workbench-text)",
                  border: "1px solid var(--workbench-border)",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
