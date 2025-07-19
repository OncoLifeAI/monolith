import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import Layout from './components/Layout';
import ChatPage from './pages/ChatPage';
import { SummariesPage, SummariesDetailsPage } from './pages/SummariesPage';
import NotesPage from './pages/NotesPage';
import LoremPage from './pages/LoremPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import ResetPassword from './pages/LoginPage/ResetPassword';
import Acknowledgement from './pages/LoginPage/Acknowledgement';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ProfilePage from './pages/ProfilePage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <UserProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <BrowserRouter>
          <Routes>
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ProtectedRoute><ResetPassword /></ProtectedRoute>} />
            <Route path="/acknowledgement" element={<ProtectedRoute><Acknowledgement /></ProtectedRoute>} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/chat" replace />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="summaries" element={<SummariesPage />} />
              <Route path="summaries/:summaryId" element={<SummariesDetailsPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="lorem" element={<LoremPage />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </LocalizationProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
