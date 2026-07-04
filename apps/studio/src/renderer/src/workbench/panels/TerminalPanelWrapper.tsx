/**
 * TerminalPanelWrapper.tsx — Self-contained Terminal panel.
 *
 * Wraps TerminalView with workspace CWD resolution that was
 * previously handled by BottomPanel.
 */

import React, { useEffect, useState } from "react";

import { TerminalView } from "../../components/terminal/TerminalView.js";

export const TerminalPanelWrapper: React.FC = () => {
  const [cwd, setCwd] = useState<string>("/");

  useEffect(() => {
    if (window.ocs?.workspace?.getActive) {
      window.ocs.workspace.getActive().then((ws) => {
        if (ws?.uri) {
          const pathStr = ws.uri.startsWith("file://") ? ws.uri.replace("file://", "") : ws.uri;
          setCwd(pathStr);
        }
      });
    }
  }, []);

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
      <TerminalView cwd={cwd} />
    </div>
  );
};
