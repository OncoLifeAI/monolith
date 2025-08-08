import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyles, SessionTimeoutManager } from '@oncolife/ui-components';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { UserTypeProvider } from './contexts/UserTypeContext';

// Shared login from ui-components
import LoginPage from '@oncolife/ui-components/pages/Login/LoginPage';

// Doctor-specific pages
import Layout from './components/Layout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import PatientsPage from './pages/Patients/PatientsPage';
import StaffPage from './pages/Staff/StaffPage';

function App() {
  return (
    <UserTypeProvider userType="doctor">
      <AuthProvider>
        <UserProvider>
          <GlobalStyles />
          <SessionTimeoutManager />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/staff" element={<StaffPage />} />
              </Route>
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </AuthProvider>
    </UserTypeProvider>
  );
}

export default App;