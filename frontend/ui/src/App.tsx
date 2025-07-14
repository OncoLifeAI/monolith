import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import Layout from './components/Layout';
import ChatPage from './pages/ChatPage';
import SummariesPage from './pages/SummariesPage';
import NotesPage from './pages/NotesPage';
import LoremPage from './pages/LoremPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import ResetPassword from './pages/LoginPage/ResetPassword';
import Acknowledgement from './pages/LoginPage/Acknowledgement';
import { ProtectedRoute } from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ProtectedRoute><ResetPassword /></ProtectedRoute>} />
            <Route path="/acknowledgement" element={<ProtectedRoute><Acknowledgement /></ProtectedRoute>} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/chat" replace />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="summaries" element={<SummariesPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="lorem" element={<LoremPage />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
