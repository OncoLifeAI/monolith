import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Layout, ProtectedRoute, SessionTimeoutManager } from '@patient-portal/ui-components';
import { AuthProvider, UserProvider, UserTypeProvider } from '@patient-portal/auth-lib';

// Patient-specific pages
import ChatsPage from './pages/Patients/ChatsPage';
import { SummariesPage } from './pages/Patients/SummariesPage';
import NotesPage from './pages/Patients/NotesPage';
import EducationPage from './pages/EducationPage';
import ProfilePage from './pages/Patients/ProfilePage';

// Shared Login components
import { ResetPassword, Acknowledgement, LoginPage } from '@patient-portal/ui-components';
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

                {/* Protected patient routes */}
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/chats" replace />} />
                  <Route path="chats" element={<ChatsPage />} />
                  <Route path="summaries" element={<SummariesPage />} />
                  <Route path="notes" element={<NotesPage />} />
                  <Route path="education" element={<EducationPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/chats" replace />} />
              </Routes>
            </Router>
          </UserTypeProvider>
        </UserProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
}

export default App;
