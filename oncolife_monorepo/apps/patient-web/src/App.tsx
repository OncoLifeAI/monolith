import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyles, SessionTimeoutManager } from '@oncolife/ui-components';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { UserTypeProvider } from './contexts/UserTypeContext';

// Shared login from ui-components
import LoginPage from './pages/LoginPage';
import ResetPassword from './pages/LoginPage/ResetPassword';
import Acknowledgement from './pages/LoginPage/Acknowledgement';

// Patient-specific pages
import SignUpPage from './pages/SignUpPage';
import Layout from './components/Layout';
import ChatsPage from './pages/ChatsPage';
import { SummariesPage, SummariesDetailsPage } from './pages/SummariesPage';
import NotesPage from './pages/NotesPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <UserTypeProvider>
      <AuthProvider>
        <UserProvider>
          <GlobalStyles />
          <SessionTimeoutManager />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/acknowledgement" element={<Acknowledgement />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route element={<Layout />}>
                <Route path="/chat" element={<ChatsPage />} />
                <Route path="/summaries" element={<SummariesPage />} />
                <Route path="/summaries/:id" element={<SummariesDetailsPage />} />
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