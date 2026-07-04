import React from "react";
interface BreadcrumbsProps {
  activeInputId?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ activeInputId }) => {
  if (!activeInputId) return null;

  // Simple split by slash to simulate breadcrumbs for the active file path
  // E.g., file:///path/to/file => ['path', 'to', 'file']
  // For now, activeInputId might be a full path or file:// URI
  const pathPart = activeInputId.replace("file://", "");
  const parts = pathPart.split("/").filter(Boolean);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: "24px",
        padding: "0 var(--spacing-lg)",
        backgroundColor: "var(--workbench-background)",
        color: "var(--workbench-text-secondary)",
        fontSize: "12px",
        userSelect: "none"
      }}
      aria-label="Breadcrumbs"
    >
      {parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        return (
          <React.Fragment key={`${part}-${index}`}>
            <span
              style={{
                cursor: "pointer",
                color: isLast ? "var(--workbench-text)" : "inherit",
                fontWeight: isLast ? 500 : 400
              }}
              className="ocs-focus-ring"
              tabIndex={0}
            >
              {part}
            </span>
            {!isLast && <span style={{ margin: "0 6px", opacity: 0.5 }}>›</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
};
