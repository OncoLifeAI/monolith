import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLogin } from '../restful/login';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authenticateLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const loginMutation = useLogin();

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        // TODO: Verify token with backend
        setToken(storedToken);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const authenticateLogin = async (email: string, password: string) => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      
      if (result.success) {
        const userData = {
          id: result.data?.user?.id || '1',
          email,
          name: result.data?.user?.name || 'User',
          role: result.data?.user?.role || 'patient'
        };
        
        setUser(userData);
        if (result.data?.token) {
          setToken(result.data.token);
          localStorage.setItem('token', result.data.token);
        }
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const userData = { id: '1', email, name, role: 'patient' };
      const authToken = 'mock-jwt-token';
      
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    authenticateLogin,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 