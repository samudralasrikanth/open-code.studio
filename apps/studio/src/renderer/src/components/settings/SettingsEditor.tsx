import React from "react";
import type { SettingSchema } from "@ocs/settings";

// Note: In reality, we'd want a way to fetch the schema from the registry.
// For now, since SettingsRegistry is in main, we need an IPC call for getAllSchemas() too,
// but for simplicity we will just rely on the resolved settings getting returned as a map,
// or we can hardcode the schemas for the UI in this MVP.
// Let's assume we can fetch them or we just display the keys and values.
// We should add an IPC channel for schemas if we want a fully dynamic UI.

// Actually, let's just make a simple key-value editor for now and improve it later.
export const SettingsEditor: React.FC = () => {
  const [settings, setSettings] = React.useState<Record<string, any>>({});
  const [scope, setScope] = React.useState<"user" | "workspace">("user");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const all = await window.ocs.settings.getAll();
        setSettings(all);
      } catch (err: any) {
        console.error("Failed to load settings:", err);
      }
    };

    loadSettings();

    const cleanup = window.ocs.settings.onChanged(({ id, value }) => {
      setSettings((prev) => ({ ...prev, [id]: value }));
    });

    return cleanup;
  }, []);

  const handleChange = async (id: string, value: any) => {
    try {
      setError(null);
      await window.ocs.settings.set(id, value, scope);
    } catch (err: any) {
      setError(err.message || "Failed to set setting");
    }
  };

  const handleReset = async (id: string) => {
    try {
      setError(null);
      await window.ocs.settings.reset(id, scope);
    } catch (err: any) {
      setError(err.message || "Failed to reset setting");
    }
  };

  return (
    <div style={{ padding: "20px", color: "#ccc", height: "100%", overflowY: "auto" }}>
      <h2 style={{ margin: "0 0 20px 0" }}>Settings</h2>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>Scope:</label>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as "user" | "workspace")}
          style={{
            backgroundColor: "#3c3c3c",
            color: "#ccc",
            border: "1px solid #555",
            padding: "4px"
          }}
        >
          <option value="user">User</option>
          <option value="workspace">Workspace</option>
        </select>
      </div>

      {error && (
        <div
          style={{
            color: "#f48771",
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #f48771"
          }}
        >
          {error}
        </div>
      )}

      {Object.entries(settings).map(([id, value]) => (
        <div
          key={id}
          style={{ marginBottom: "20px", borderBottom: "1px solid #333", paddingBottom: "10px" }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{id}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {typeof value === "boolean" ? (
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleChange(id, e.target.checked)}
              />
            ) : typeof value === "number" ? (
              <input
                type="number"
                value={value}
                onChange={(e) => handleChange(id, Number(e.target.value))}
                style={{
                  backgroundColor: "#3c3c3c",
                  color: "#ccc",
                  border: "1px solid #555",
                  padding: "4px"
                }}
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(id, e.target.value)}
                style={{
                  backgroundColor: "#3c3c3c",
                  color: "#ccc",
                  border: "1px solid #555",
                  padding: "4px",
                  flex: 1
                }}
              />
            )}
            <button
              onClick={() => handleReset(id)}
              style={{
                backgroundColor: "#4d4d4d",
                color: "#ccc",
                border: "none",
                padding: "4px 8px",
                cursor: "pointer"
              }}
            >
              Reset
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
