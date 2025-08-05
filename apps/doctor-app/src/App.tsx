import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Layout, ProtectedRoute, SessionTimeoutManager } from '@patient-portal/ui-components';
import { AuthProvider, UserProvider, UserTypeProvider } from '@patient-portal/auth-lib';

// Doctor-specific pages
import DashboardPage from './pages/Doctors/Dashboard';
import PatientsPage from './pages/Doctors/Patients';
import StaffPage from './pages/Doctors/Staff';

// Shared Login components
import { LoginPage, ResetPassword, Acknowledgement } from '@patient-portal/ui-components';
import SignUpPage from './pages/SignUpPage';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AuthProvider>
        <UserProvider>
          <UserTypeProvider>
            <Router>
              <SessionTimeoutManager />
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/acknowledgement" element={<Acknowledgement />} />

                {/* Protected doctor routes */}
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="patients" element={<PatientsPage />} />
                  <Route path="staff" element={<StaffPage />} />
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
          </UserTypeProvider>
        </UserProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
}

export default App;
