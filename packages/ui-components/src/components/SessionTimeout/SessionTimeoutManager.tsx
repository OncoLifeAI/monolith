import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SESSION_TIMEOUT_MINUTES } from '../config/api';
import SessionTimeoutModal from './SessionTimeoutModal';

export const SESSION_START_KEY = 'sessionStartTime';

const SessionTimeoutManager: React.FC = () => {
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let authCheckInterval: NodeJS.Timeout | null = null;

    const startSessionTimeout = () => {
      const authToken = localStorage.getItem('authToken');
      
      // Only start session timeout if user is authenticated
      if (!authToken) {
        // If not authenticated, clear any existing session start time
        sessionStorage.removeItem(SESSION_START_KEY);
        setSessionTimedOut(false);
        return;
      }

      let sessionStart = sessionStorage.getItem(SESSION_START_KEY);
      const now = Date.now();
      
      // Only set session start time if user is authenticated and no session exists
      if (!sessionStart) {
        sessionStorage.setItem(SESSION_START_KEY, now.toString());
        sessionStart = now.toString();
      }
      
      const sessionStartTime = parseInt(sessionStart, 10);
      const timeoutMs = SESSION_TIMEOUT_MINUTES * 60 * 1000;
      const elapsed = now - sessionStartTime;
      const remaining = timeoutMs - elapsed;

      if (remaining <= 0) {
        setSessionTimedOut(true);
        return;
      }

      timer = setTimeout(() => {
        setSessionTimedOut(true);
      }, remaining);
    };

    // Start the session timeout
    startSessionTimeout();

    // Set up an interval to check if user authentication state changes
    authCheckInterval = setInterval(() => {
      const currentAuthToken = localStorage.getItem('authToken');
      if (!currentAuthToken) {
        // User logged out, clear session and timer
        sessionStorage.removeItem(SESSION_START_KEY);
        setSessionTimedOut(false);
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      } else if (!timer && !sessionTimedOut) {
        // User logged in and no timer is running, start timeout
        startSessionTimeout();
      }
    }, 1000); // Check every second

    return () => {
      if (timer) clearTimeout(timer);
      if (authCheckInterval) clearInterval(authCheckInterval);
    };
  }, [sessionTimedOut]);

  const handleLoginAgain = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem(SESSION_START_KEY);
    setSessionTimedOut(false);
    navigate('/login', { replace: true });
  };

  return (
    <SessionTimeoutModal show={sessionTimedOut} onLoginAgain={handleLoginAgain} />
  );
};

export default SessionTimeoutManager; 