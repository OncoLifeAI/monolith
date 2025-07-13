import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // For routes that require authentication
  if (requireAuth && !isAuthenticated) {
    // Redirect to login page, but save the attempted location
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // For routes that should only be accessible when NOT authenticated (like login/register)
  if (!requireAuth && isAuthenticated) {
    // Redirect to dashboard if user is already authenticated
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}; 