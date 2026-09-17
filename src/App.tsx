import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import ReportLitter from './pages/ReportLitter';
import MyActivities from './pages/MyActivities';
import Rewards from './pages/Rewards';
import Events from './pages/Events';
import Articles from './pages/Articles';
import Admin from './pages/Admin';

// Dummy ProtectedRoute: just renders children, no auth logic
function ProtectedRoute({ children }: { children: React.ReactNode, adminOnly?: boolean }) {
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="report" element={<ReportLitter />} />
            <Route path="activities" element={<MyActivities />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="events" element={<Events />} />
            <Route path="articles" element={<Articles />} />
            <Route path="admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
