/* eslint-disable */
import React, { useEffect, useState } from "react";

export const EditorArea: React.FC = () => {
  const [editorState, setEditorState] = useState<any>(null);

  useEffect(() => {
    // Initial fetch
    window.ocs.editor.getState().then(setEditorState);

    // Listen for updates
    const unsubscribe = window.ocs.editor.onStateChanged((state) => {
      setEditorState(state);
    });

    return unsubscribe;
  }, []);

  if (!editorState || editorState.groups.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: "#1e1e1e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div style={{ textAlign: "center", opacity: 0.5 }}>
          <h1>Open-Code.Studio</h1>
          <p>Select a file to open</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", backgroundColor: "#1e1e1e" }}>
      {/* For now, just render the first group. We can add split view later */}
      <EditorGroupView group={editorState.groups[0]} />
    </div>
  );
};

// -- Mock EditorGroupView for now, I'll write the real one in a separate file
import { EditorGroupView } from "./EditorGroupView.js";
