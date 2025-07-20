import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SESSION_TIMEOUT_MINUTES } from '../config/api';
import SessionTimeoutModal from './SessionTimeoutModal';

const SessionTimeoutManager: React.FC = () => {
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSessionTimedOut(true);
    }, SESSION_TIMEOUT_MINUTES * 60 * 1000);
    return () => clearTimeout(timer);
  }, []);

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