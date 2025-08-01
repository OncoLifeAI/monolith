import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { UserTypeProvider, useUserType } from './contexts/UserTypeContext';
import Layout from './components/Layout';
import ChatsPage from './pages/Patients/ChatsPage';
import { SummariesPage, SummariesDetailsPage } from './pages/Patients/SummariesPage';
import NotesPage from './pages/Patients/NotesPage';
import EducationPage from './pages/EducationPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import ResetPassword from './pages/LoginPage/ResetPassword';
import Acknowledgement from './pages/LoginPage/Acknowledgement';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ProfilePage from './pages/Patients/ProfilePage';
import SessionTimeoutManager from './components/SessionTimeoutManager';
import DashboardPage from './pages/Doctors/Dashboard';
import PatientsPage from './pages/Doctors/Patients';
import StaffPage from './pages/Doctors/Staff';

const excludedRoutes = ['/login', '/signup', '/reset-password', '/acknowledgement'];

// Patient-only routes
const patientRoutes = ['/chat', '/summaries', '/notes', '/education'];
// Doctor-only routes  
const doctorRoutes = ['/dashboard', '/patients', '/staff'];

const RestrictedRoute: React.FC<{ children: React.ReactNode; path: string }> = ({ children, path }) => {
  const { isDoctor } = useUserType();
  
  // Check if current path is restricted based on user type
  const isPatientRoute = patientRoutes.some(route => path.startsWith(route));
  const isDoctorRoute = doctorRoutes.some(route => path.startsWith(route));
  
  if (isDoctor && isPatientRoute) {
    // Doctor trying to access patient route - redirect to doctor default
    return <Navigate to="/dashboard" replace />;
  }
  
  if (!isDoctor && isDoctorRoute) {
    // Patient trying to access doctor route - redirect to patient default
    return <Navigate to="/chat" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <>
      {!excludedRoutes.includes(location.pathname) && <SessionTimeoutManager />}
      <Routes>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ProtectedRoute><ResetPassword /></ProtectedRoute>} />
        <Route path="/acknowledgement" element={<ProtectedRoute><Acknowledgement /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="chat" element={<RestrictedRoute path="/chat"><ChatsPage /></RestrictedRoute>} />
          <Route path="summaries" element={<RestrictedRoute path="/summaries"><SummariesPage /></RestrictedRoute>} />
          <Route path="summaries/:summaryId" element={<RestrictedRoute path="/summaries"><SummariesDetailsPage /></RestrictedRoute>} />
          <Route path="notes" element={<RestrictedRoute path="/notes"><NotesPage /></RestrictedRoute>} />
          <Route path="education" element={<RestrictedRoute path="/education"><EducationPage /></RestrictedRoute>} />
          {/* Doctor routes */}
          <Route path="dashboard" element={<RestrictedRoute path="/dashboard"><DashboardPage /></RestrictedRoute>} />
          <Route path="patients" element={<RestrictedRoute path="/patients"><PatientsPage /></RestrictedRoute>} />
          <Route path="staff" element={<RestrictedRoute path="/staff"><StaffPage /></RestrictedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <UserProvider>
        <UserTypeProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </LocalizationProvider>
        </UserTypeProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
