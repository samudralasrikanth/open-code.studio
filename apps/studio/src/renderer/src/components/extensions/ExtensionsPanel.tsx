import type { InstalledExtension } from "@ocs/extensions";
import { SearchIcon, SparklesIcon } from "@ocs/ui";
import React, { useState, useRef, useCallback, useEffect } from "react";

import { useExtensions } from "./useExtensions.js";

const formatDownloads = (num?: number): string => {
  if (num === undefined || num === null) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
};

interface InstallButtonProps {
  extId: string;
  initialInstalled?: boolean;
  initialEnabled?: boolean;
  onStateChange?: () => void;
}

export const InstallButton: React.FC<InstallButtonProps> = ({
  extId,
  initialInstalled,
  initialEnabled,
  onStateChange
}) => {
  const [installed, setInstalled] = useState(initialInstalled ?? false);
  const [enabled, setEnabled] = useState(initialEnabled ?? true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (initialInstalled !== undefined) return; // Skip fetch if passed via props

    void (async () => {
      try {
        const getInstalled = window.ocs.extensions.getInstalled;
        if (!getInstalled) return;

        const res = await getInstalled();
        if (mounted && res.success && res.data) {
          const installedList = res.data as InstalledExtension[];
          const ext = installedList.find((e) => e.id === extId);
          if (ext) {
            setInstalled(true);
            setEnabled(ext.enabled);
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [extId, initialInstalled]);

  const handleInstall = async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    event.stopPropagation();
    if (installed || processing) return;

    setProcessing(true);
    try {
      const res = await window.ocs.extensions.install(extId);
      if (res.success) {
        setInstalled(true);
        setEnabled(true);
        onStateChange?.();
      } else {
        alert("Install failed: " + (res.error?.message || "Unknown error"));
      }
    } catch (err) {
      alert("Install failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleEnable = async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    event.stopPropagation();
    if (!installed || processing) return;

    setProcessing(true);
    try {
      const api = window.ocs.extensions;
      const res = enabled ? await api.disable(extId) : await api.enable(extId);

      if (res?.success) {
        setEnabled(!enabled);
        onStateChange?.();
      }
    } catch (err) {
      alert("Toggle failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  const handleUninstall = async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    event.stopPropagation();
    if (!installed || processing) return;

    if (!confirm("Are you sure you want to uninstall this extension?")) return;

    setProcessing(true);
    try {
      const api = window.ocs.extensions;
      const res = await api.uninstall(extId);
      if (res.success) {
        setInstalled(false);
        onStateChange?.();
      } else {
        alert("Uninstall failed: " + (res?.error?.message || "Unknown error"));
      }
    } catch (err) {
      alert("Uninstall failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  if (installed) {
    return (
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          onClick={(e) => void handleToggleEnable(e)}
          disabled={processing}
          style={{
            backgroundColor: "var(--color-bg-tertiary)",
            color: "var(--workbench-text)",
            border: "none",
            padding: "2px 8px",
            borderRadius: "2px",
            fontSize: "12px",
            cursor: processing ? "default" : "pointer",
            opacity: processing ? 0.7 : 1
          }}
        >
          {enabled ? "Disable" : "Enable"}
        </button>
        <button
          onClick={(e) => void handleUninstall(e)}
          disabled={processing}
          style={{
            backgroundColor: "var(--color-bg-tertiary)",
            color: "var(--color-deleted)",
            border: "none",
            padding: "2px 8px",
            borderRadius: "2px",
            fontSize: "12px",
            cursor: processing ? "default" : "pointer",
            opacity: processing ? 0.7 : 1
          }}
        >
          Uninstall
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(event) => {
        void handleInstall(event);
      }}
      disabled={processing}
      style={{
        backgroundColor: "#007acc",
        color: "#fff",
        border: "none",
        padding: "2px 10px",
        borderRadius: "2px",
        fontSize: "12px",
        cursor: processing ? "default" : "pointer",
        lineHeight: "18px",
        opacity: processing ? 0.7 : 1
      }}
    >
      {processing ? "Installing..." : "Install"}
    </button>
  );
};

export const ExtensionsPanel: React.FC = () => {
  const [query, setQuery] = useState("");
  const { extensions, state, error, loadMore } = useExtensions(query);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (state === "loading-first" || state === "loading-more") return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && state === "ready") {
          void loadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [state, loadMore]
  );

  const [installedExtensions, setInstalledExtensions] = useState<InstalledExtension[]>([]);
  const [installedExpanded, setInstalledExpanded] = useState(true);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const getInstalled = window.ocs.extensions.getInstalled;
        if (!getInstalled) return;

        const res = await getInstalled();
        if (mounted && res.success && res.data) {
          setInstalledExtensions(res.data as InstalledExtension[]);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const renderInstalledSection = () => {
    if (query.trim() !== "") return null;
    if (installedExtensions.length === 0) return null;

    return (
      <div style={{ marginBottom: "16px" }}>
        <div
          onClick={() => setInstalledExpanded(!installedExpanded)}
          style={{
            padding: "4px 14px",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            color: "var(--workbench-text-muted)",
            marginBottom: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            style={{
              transform: installedExpanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.1s"
            }}
          >
            <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06z" />
          </svg>
          INSTALLED ({installedExtensions.length})
        </div>

        {installedExpanded && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {installedExtensions.map((ext) => (
              <div
                key={ext.id}
                onClick={() => {
                  if (window.ocs?.editor?.open) {
                    void window.ocs.editor.open("extension://" + ext.id, {
                      preview: false,
                      active: true
                    });
                  }
                }}
                style={{
                  display: "flex",
                  gap: "10px",
                  padding: "var(--spacing-sm) var(--spacing-md)",
                  cursor: "pointer",
                  transition: "background-color var(--transition-fast)",
                  position: "relative"
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--color-bg-hover)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {/* Icon Fallback */}
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    flexShrink: 0,
                    backgroundColor: "var(--color-bg-tertiary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    color: "var(--workbench-text-muted)"
                  }}
                >
                  {ext.name.substring(0, 1).toUpperCase()}
                </div>

                {/* Details */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline"
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--workbench-text)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        opacity: ext.enabled ? 1 : 0.6
                      }}
                    >
                      {ext.name}
                    </h3>
                    <span style={{ fontSize: "10px", color: "var(--workbench-text-muted)" }}>
                      v{ext.version}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "var(--workbench-text-muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {ext.manifest.description || "No description"}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "2px",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "var(--workbench-text-muted)" }}>
                      {ext.publisher}
                    </div>
                    <InstallButton
                      extId={ext.id}
                      initialInstalled={true}
                      initialEnabled={ext.enabled}
                      onStateChange={() => {
                        // Refresh the list when state changes
                        void window.ocs.extensions.getInstalled().then((res) => {
                          if (res.success && res.data) {
                            setInstalledExtensions(res.data as InstalledExtension[]);
                          }
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderEmptyState = () => {
    if (state === "loading-first") {
      return (
        <div
          style={{
            padding: "var(--spacing-xl)",
            textAlign: "center",
            color: "var(--workbench-text-muted)",
            fontSize: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            alignItems: "center"
          }}
        >
          <div
            className="ocs-spinner"
            style={{
              width: "24px",
              height: "24px",
              border: "2px solid var(--workbench-border)",
              borderTopColor: "var(--workbench-accent)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}
          />
          <span>Searching Open VSX...</span>
        </div>
      );
    }

    if (state === "error" && error) {
      let message = error.message;
      let icon = "⚠️";
      if (error.code === "OFFLINE") {
        message = "You are currently offline. Check your network connection.";
        icon = "🔌";
      } else if (error.code === "RATE_LIMITED") {
        message = "Too many requests. Please try again in a moment.";
        icon = "⏳";
      } else if (error.code === "REGISTRY_UNAVAILABLE") {
        message = "The extension registry is currently down for maintenance.";
        icon = "🛠️";
      }

      return (
        <div
          style={{
            padding: "var(--spacing-xl) var(--spacing-md)",
            textAlign: "center",
            color: "var(--workbench-text)",
            fontSize: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "center"
          }}
        >
          <span style={{ fontSize: "24px" }}>{icon}</span>
          <strong style={{ color: "var(--color-deleted)" }}>{message}</strong>
          <button
            onClick={() => setQuery(query + " ")}
            style={{
              marginTop: "12px",
              padding: "6px 12px",
              backgroundColor: "var(--color-bg-hover)",
              border: "1px solid var(--workbench-border)",
              borderRadius: "4px",
              color: "var(--workbench-text)",
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    if (extensions.length === 0 && (state === "ready" || state === "end-of-results")) {
      return (
        <div
          style={{
            padding: "var(--spacing-xl) var(--spacing-md)",
            textAlign: "center",
            color: "var(--workbench-text-muted)",
            fontSize: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            alignItems: "center"
          }}
        >
          <SearchIcon size={32} color="var(--workbench-border-strong)" />
          <span>No extensions found for "{query}"</span>
          <button
            onClick={() => setQuery("")}
            style={{
              padding: "6px 12px",
              backgroundColor: "transparent",
              border: "1px solid var(--workbench-accent)",
              borderRadius: "12px",
              color: "var(--workbench-accent)",
              cursor: "pointer"
            }}
          >
            Clear Search
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        backgroundColor: "var(--workbench-sidebar)",
        color: "var(--workbench-text)",
        fontFamily: "var(--font-sans)"
      }}
      aria-label="Extensions Panel"
    >
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "uppercase",
          color: "var(--workbench-text)"
        }}
      >
        <span>Extensions: Marketplace</span>
      </div>

      {/* Search Input */}
      <div style={{ padding: "0 14px 10px 14px" }}>
        <div style={{ position: "relative" }}>
          <input
            className="ocs-focus-ring"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Extensions in Marketplace"
            style={{
              width: "100%",
              padding: "4px 24px 4px 6px",
              backgroundColor: "var(--color-bg-hover)",
              color: "var(--workbench-text)",
              border: "1px solid transparent",
              outline: "none"
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              right: "6px",
              color: "var(--workbench-text-muted)"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14 4h-3.25V3h-1.5v1H2v1h7.25v1h1.5V5H14V4zM14 11h-7.25v-1h-1.5v1H2v1h3.25v1h1.5v-1H14v-1z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Help text */}
      <div
        style={{
          padding: "0 14px 10px 14px",
          fontSize: "11px",
          color: "var(--workbench-text)",
          lineHeight: 1.4
        }}
      >
        By default, OCS IDE uses{" "}
        <a
          href="https://open-vsx.org"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#007acc", textDecoration: "none" }}
        >
          Open VSX
        </a>{" "}
        as a marketplace. This can be changed in{" "}
        <a href="#" style={{ color: "#007acc", textDecoration: "none" }}>
          OCS IDE settings
        </a>
        .
      </div>

      {/* Extension List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {renderInstalledSection()}

        <div
          style={{
            padding: "4px 14px",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            color: "var(--workbench-text-muted)",
            marginBottom: "4px"
          }}
        >
          {query.trim() ? "Search Results" : "Popular"}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {extensions.length === 0
            ? renderEmptyState()
            : extensions.map((ext, idx) => {
                return (
                  <div
                    key={ext.id}
                    ref={idx === extensions.length - 1 ? lastElementRef : null}
                    onClick={() => {
                      if (window.ocs?.editor?.open) {
                        void window.ocs.editor.open("extension://" + ext.id, {
                          preview: false,
                          active: true
                        });
                      }
                    }}
                    style={{
                      display: "flex",
                      gap: "10px",
                      padding: "var(--spacing-sm) var(--spacing-md)",
                      cursor: "pointer",
                      transition: "background-color var(--transition-fast)",
                      position: "relative"
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--color-bg-hover)")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {/* Icon */}
                    <div
                      style={{ width: "42px", height: "42px", flexShrink: 0, overflow: "hidden" }}
                    >
                      {ext.iconUrl ? (
                        <img
                          src={ext.iconUrl}
                          alt={ext.displayName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            opacity: 0,
                            transition: "opacity 0.3s ease"
                          }}
                          onLoad={(e) => (e.currentTarget.style.opacity = "1")}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            backgroundColor: "var(--color-bg-tertiary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <SparklesIcon size={20} color="var(--color-hyper-purple)" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px"
                      }}
                    >
                      {/* Row 1: Title & Stats */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline"
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "var(--workbench-text)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {ext.displayName}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "11px",
                            color: "var(--workbench-text-muted)",
                            flexShrink: 0
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M14.25 10.74V13.5H1.75v-2.76H.25v3.5h15.5v-3.5h-1.5zM10.8 7.37L8.75 9.42V1.5H7.25v7.92L5.2 7.37l-1.06 1.06 3.86 3.86 3.86-3.86-1.06-1.06z"
                              />
                            </svg>
                            {formatDownloads(ext.downloadCount)}
                          </span>
                          {ext.rating > 0 && (
                            <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M8 12.3l-4.14 2.5 1.1-4.72L1.24 6.8l4.84-.4L8 2l1.92 4.4 4.84.4-3.72 3.28 1.1 4.72L8 12.3z"
                                />
                              </svg>
                              {(ext.rating ?? 0).toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Description */}
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "var(--workbench-text-muted)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {ext.description || "No description"}
                      </p>

                      {/* Row 3: Publisher & Install Button */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: "2px"
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--workbench-text-muted)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            marginRight: "10px"
                          }}
                        >
                          {ext.publisher}
                        </div>
                        <InstallButton extId={ext.id} />
                      </div>
                    </div>
                  </div>
                );
              })}

          {state === "loading-more" && (
            <div
              style={{
                padding: "var(--spacing-md)",
                textAlign: "center",
                color: "var(--workbench-text-muted)",
                fontSize: "12px"
              }}
            >
              Loading more...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
