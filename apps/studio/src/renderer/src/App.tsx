import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary.js'
import { WelcomeScreen } from './screens/WelcomeScreen.js'

export function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        {/* Future routes added by subsequent epics */}
        {/* <Route path="/workspace/:id" element={<WorkspaceScreen />} /> */}
      </Routes>
    </ErrorBoundary>
  )
}
