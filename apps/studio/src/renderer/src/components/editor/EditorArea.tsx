import React, { useEffect, useState } from "react";

export const EditorArea: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    const refreshSelection = async (): Promise<void> => {
      try {
        const stats = await window.ocs.explorer.getStats();
        const selectedId = stats.selectedNodeIds[0];
        if (!selectedId) {
          setSelectedFile(null);
          return;
        }
        const nodes = await window.ocs.explorer.getVisibleNodes();
        const selected = nodes.find((n) => n.node.id === selectedId && !n.node.isDirectory);
        setSelectedFile(selected?.node.name ?? null);
      } catch {
        setSelectedFile(null);
      }
    };

    void refreshSelection();
    const unsubscribe = window.ocs.explorer.onStateChanged(() => {
      void refreshSelection();
    });
    return unsubscribe;
  }, []);

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#1e1e1e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 0
      }}
    >
      <div style={{ textAlign: "center", opacity: 0.6, maxWidth: "400px", padding: "24px" }}>
        {selectedFile ? (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
            <h2 style={{ fontSize: "16px", fontWeight: 500, margin: "0 0 8px", color: "#ccc" }}>
              {selectedFile}
            </h2>
            <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
              Editor Platform coming in EPIC-6
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⬡</div>
            <h2 style={{ fontSize: "18px", fontWeight: 500, margin: "0 0 8px", color: "#ccc" }}>
              Open-Code.Studio
            </h2>
            <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>Select a file to open</p>
          </>
        )}
      </div>
    </div>
  );
};
