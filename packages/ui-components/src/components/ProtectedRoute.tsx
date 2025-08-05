import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@patient-portal/auth-lib';

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
    <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requireAuth && isAuthenticated) {
    <Navigate to={location.pathname} />;
  }

  return <>{children}</>;
}; 