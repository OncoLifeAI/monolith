import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useFetchProfile, getCachedProfile } from '../services/profile';

interface UserContextType {
  profile: any;
  isLoading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  const cached = getCachedProfile();
  const { data: profile, isLoading, error } = useFetchProfile({
    enabled: isAuthenticated
  });

  const value: UserContextType = {
    profile: (profile && Object.keys(profile).length > 0 ? profile : null) || cached || null,
    isLoading: isAuthenticated ? isLoading : false,
    error: error ? String(error) : null,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
