import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useWorkspace } from "../../hooks/useWorkspace.js";
import { flowLog } from "../../utils/flow-log.js";

import { Workbench } from "./Workbench.js";

export const WorkspaceLoader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workspace: activeWorkspace, isLoading } = useWorkspace();

  useEffect(() => {
    flowLog({
      domain: "workspace",
      source: "renderer",
      action: "workspace-loader:mount",
      context: { routeWorkspaceId: id, activeWorkspaceId: activeWorkspace?.id }
    });

    if (!isLoading && !activeWorkspace) {
      // If loading is done and there's no workspace, bounce to welcome screen
      flowLog({
        domain: "workspace",
        source: "renderer",
        action: "workspace-loader:no-workspace-redirect",
        context: { routeWorkspaceId: id }
      });
      navigate("/");
    }
  }, [id, activeWorkspace, isLoading, navigate]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          backgroundColor: "#1e1e1e",
          color: "#ccc",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif"
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}
        >
          <div
            className="loader-spinner"
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid #333",
              borderTopColor: "#007acc",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}
          />
          <div>Opening Workspace...</div>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!activeWorkspace) {
    return null; // Will redirect in useEffect
  }

  return <Workbench workspaceName={activeWorkspace.displayName || activeWorkspace.id} />;
};
