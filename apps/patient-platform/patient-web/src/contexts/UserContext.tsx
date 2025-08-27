import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useFetchProfile, getCachedProfile } from '../services/profile';
import { isAuthenticated } from '../utils/authUtils';

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
  const userIsAuthenticated = isAuthenticated();
  const cached = getCachedProfile();
  const { data: profile, isLoading, error } = useFetchProfile({
    enabled: userIsAuthenticated
  });

  const value: UserContextType = {
    profile: (profile && Object.keys(profile).length > 0 ? profile : null) || cached || null,
    isLoading: userIsAuthenticated ? isLoading : false,
    error: error ? String(error) : null,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
