import React from "react";
import { Routes, Route } from "react-router-dom";

import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { WorkspaceLoader } from "./components/workbench/WorkspaceLoader.js";
import { StartupScreen } from "./screens/StartupScreen.js";
import { WelcomeScreen } from "./screens/WelcomeScreen.js";

export function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<StartupScreen />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/workspace/:id" element={<WorkspaceLoader />} />
      </Routes>
    </ErrorBoundary>
  );
}
