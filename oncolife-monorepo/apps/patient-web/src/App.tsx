import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyles, SessionTimeoutManager } from '@oncolife/ui-components';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { UserTypeProvider } from './contexts/UserTypeContext';

// Shared login from ui-components
import LoginPage from '@oncolife/ui-components/pages/Login/LoginPage';

// Patient-specific pages
import SignUpPage from './pages/SignUpPage';
import Layout from './components/Layout';
import ChatsPage from './pages/Chats/ChatsPage';
import SummariesPage from './pages/Summaries/SummariesPage';
import NotesPage from './pages/Notes/NotesPage';
import ProfilePage from './pages/Profile/ProfilePage';

function App() {
  return (
    <UserTypeProvider userType="patient">
      <AuthProvider>
        <UserProvider>
          <GlobalStyles />
          <SessionTimeoutManager />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route element={<Layout />}>
                <Route path="/chat" element={<ChatsPage />} />
                <Route path="/summaries" element={<SummariesPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              <Route path="/" element={<Navigate to="/chat" />} />
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </AuthProvider>
    </UserTypeProvider>
  );
}

export default App;