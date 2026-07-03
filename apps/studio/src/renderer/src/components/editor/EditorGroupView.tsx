/* eslint-disable */
import React from "react";

import { EditorInputTabs } from "./EditorInputTabs.js";
import { MonacoEditorView } from "./MonacoEditorView.js";

interface EditorGroupViewProps {
  group: any; // Using any for now until we share types
}

export const EditorGroupView: React.FC<EditorGroupViewProps> = ({ group }) => {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      <EditorInputTabs group={group} />
      <div style={{ flex: 1, position: "relative" }}>
        {/* We only render the active input for now */}
        {group.activeInput && <MonacoEditorView input={group.activeInput} />}
      </div>
    </div>
  );
};
