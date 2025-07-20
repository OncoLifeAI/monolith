import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SESSION_TIMEOUT_MINUTES } from '../config/api';
import SessionTimeoutModal from './SessionTimeoutModal';

const SessionTimeoutManager: React.FC = () => {
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSessionTimedOut(true);
    }, SESSION_TIMEOUT_MINUTES * 60 * 1000);
  }, []);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    const handleActivity = () => {
      if (!sessionTimedOut) resetTimer();
    };
    events.forEach(event => window.addEventListener(event, handleActivity));
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTimer, sessionTimedOut]);

  const handleLoginAgain = () => {
    localStorage.removeItem('authToken');
    setSessionTimedOut(false);
    navigate('/login', { replace: true });
  };

  return (
    <SessionTimeoutModal show={sessionTimedOut} onLoginAgain={handleLoginAgain} />
  );
};

export default SessionTimeoutManager; 