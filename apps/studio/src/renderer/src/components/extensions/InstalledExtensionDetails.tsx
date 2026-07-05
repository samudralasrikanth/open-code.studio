import type { InstalledExtension } from "@ocs/extensions";
import React from "react";

interface InstalledExtensionDetailsProps {
  extension: InstalledExtension;
}

export const InstalledExtensionDetails: React.FC<InstalledExtensionDetailsProps> = ({
  extension
}) => {
  const { manifest } = extension;

  const hasDependencies = (manifest.extensionDependencies ?? []).length > 0;

  return (
    <div
      style={{
        padding: "20px",
        color: "var(--workbench-text)",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}
    >
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {/* We would use an icon if we extracted it, but for now fallback */}
        <div
          style={{
            width: "64px",
            height: "64px",
            backgroundColor: "var(--workbench-panel)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            color: "var(--workbench-text-muted)"
          }}
        >
          {manifest.name.substring(0, 1).toUpperCase()}
        </div>

        <div>
          <h1 style={{ margin: "0 0 4px 0", fontSize: "20px" }}>{manifest.name}</h1>
          <div
            style={{
              display: "flex",
              gap: "12px",
              fontSize: "12px",
              color: "var(--workbench-text-muted)"
            }}
          >
            <span>{manifest.publisher}</span>
            <span>v{manifest.version}</span>
          </div>
          <p style={{ margin: "8px 0 0 0", fontSize: "13px", lineHeight: "1.4" }}>
            {manifest.description || "No description provided."}
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: "8px",
          padding: "12px",
          backgroundColor: "var(--workbench-warning-bg, rgba(204, 153, 0, 0.1))",
          border: "1px solid var(--workbench-warning-border, rgba(204, 153, 0, 0.4))",
          borderRadius: "4px",
          fontSize: "12px",
          color: "var(--workbench-warning-text, #e2b83c)"
        }}
      >
        <strong>⚠ Requires Extension Host (Future Epic)</strong>
        <p style={{ margin: "4px 0 0 0" }}>
          This extension is installed and its manifest has been validated, but the Open Code Studio
          extension host is not yet implemented. Features contributed by this extension will not
          execute.
        </p>
      </div>

      {hasDependencies && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "var(--workbench-info-bg, rgba(0, 122, 204, 0.1))",
            border: "1px solid var(--workbench-info-border, rgba(0, 122, 204, 0.4))",
            borderRadius: "4px",
            fontSize: "12px"
          }}
        >
          <strong>Dependencies:</strong>
          <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
            {manifest.extensionDependencies!.map((dep) => (
              <li key={dep}>{dep}</li>
            ))}
          </ul>
        </div>
      )}

      {manifest.contributes && (
        <div>
          <h2
            style={{
              fontSize: "14px",
              borderBottom: "1px solid var(--workbench-border)",
              paddingBottom: "4px"
            }}
          >
            Contributions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
            {manifest.contributes.commands && manifest.contributes.commands.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: "12px",
                    margin: "0 0 4px 0",
                    color: "var(--workbench-text-secondary)"
                  }}
                >
                  Commands
                </h3>
                <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "12px" }}>
                  {(manifest.contributes.commands as { command: string; title: string }[]).map(
                    (cmd) => (
                      <li key={cmd.command}>
                        {cmd.title} ({cmd.command})
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {manifest.contributes.themes && manifest.contributes.themes.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: "12px",
                    margin: "0 0 4px 0",
                    color: "var(--workbench-text-secondary)"
                  }}
                >
                  Themes
                </h3>
                <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "12px" }}>
                  {(manifest.contributes.themes as { id?: string; label?: string }[]).map(
                    (theme) => (
                      <li key={theme.id || theme.label}>{theme.label || theme.id}</li>
                    )
                  )}
                </ul>
              </div>
            )}

            {manifest.contributes.iconThemes && manifest.contributes.iconThemes.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: "12px",
                    margin: "0 0 4px 0",
                    color: "var(--workbench-text-secondary)"
                  }}
                >
                  Icon Themes
                </h3>
                <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "12px" }}>
                  {(manifest.contributes.iconThemes as { id?: string; label?: string }[]).map(
                    (theme) => (
                      <li key={theme.id || theme.label}>{theme.label || theme.id}</li>
                    )
                  )}
                </ul>
              </div>
            )}

            {manifest.contributes.languages && manifest.contributes.languages.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: "12px",
                    margin: "0 0 4px 0",
                    color: "var(--workbench-text-secondary)"
                  }}
                >
                  Languages
                </h3>
                <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "12px" }}>
                  {(manifest.contributes.languages as { id: string }[]).map((lang) => (
                    <li key={lang.id}>{lang.id}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {manifest.activationEvents && manifest.activationEvents.length > 0 && (
        <div>
          <h2
            style={{
              fontSize: "14px",
              borderBottom: "1px solid var(--workbench-border)",
              paddingBottom: "4px"
            }}
          >
            Activation Events
          </h2>
          <ul
            style={{
              margin: "8px 0 0 0",
              paddingLeft: "20px",
              fontSize: "12px",
              fontFamily: "var(--font-mono)"
            }}
          >
            {manifest.activationEvents.map((event: string, idx: number) => (
              <li key={idx}>{event}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
