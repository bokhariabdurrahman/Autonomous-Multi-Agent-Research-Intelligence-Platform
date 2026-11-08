import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewResearchPage } from './pages/NewResearchPage';
import { AgentMonitorPage } from './pages/AgentMonitorPage';
import { ResultsPage } from './pages/ResultsPage';
import { ReportViewerPage } from './pages/ReportViewerPage';
import { DocumentLibraryPage } from './pages/DocumentLibraryPage';
import { SettingsPage } from './pages/SettingsPage';
import { MainLayout } from './layouts/MainLayout';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Marketing & Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated Workspace */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/new-research" element={<NewResearchPage />} />
          <Route path="/agents" element={<AgentMonitorPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/reports" element={<ReportViewerPage />} />
          <Route path="/documents" element={<DocumentLibraryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
