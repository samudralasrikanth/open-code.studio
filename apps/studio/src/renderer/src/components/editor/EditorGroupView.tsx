/* eslint-disable */
import React from "react";

import { ExtensionEditorView } from "../extensions/ExtensionEditorView.js";

import { EditorInputTabs } from "./EditorInputTabs.js";
import { MonacoEditorView } from "./MonacoEditorView.js";

interface EditorGroupViewProps {
  group: any; // Using any for now until we share types
}

export const EditorGroupView: React.FC<EditorGroupViewProps> = ({ group }) => {
  const isExtension = group.activeInput?.id?.startsWith("extension://");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      <EditorInputTabs group={group} />
      <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
        {group.activeInput && isExtension && <ExtensionEditorView input={group.activeInput} />}
        {group.activeInput && !isExtension && <MonacoEditorView input={group.activeInput} />}
      </div>
    </div>
  );
};
