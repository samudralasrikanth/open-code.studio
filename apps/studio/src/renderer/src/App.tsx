import React from "react";
import { Routes, Route } from "react-router-dom";

import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { WelcomeScreen } from "./screens/WelcomeScreen.js";
import { WorkspaceScreen } from "./screens/WorkspaceScreen.js";

export function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/workspace/:id" element={<WorkspaceScreen />} />
      </Routes>
    </ErrorBoundary>
  );
}
