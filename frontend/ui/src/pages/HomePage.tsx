import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Patient Portal
        </h1>
        
        {isAuthenticated ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Welcome back, {user?.name}!
            </p>
            <Link
              to="/dashboard"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-center mb-6">
              Access your medical records and manage your health information
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block w-full bg-gray-200 text-gray-800 text-center py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 