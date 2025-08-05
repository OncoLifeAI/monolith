import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

// TODO: Import from api-client package once it's set up
// import { useFetchProfile } from '@patient-portal/api-client';

// Temporary mock - will be moved to api-client package
const useFetchProfile = () => {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
};

// TODO: Import from common-types package once it's set up
interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
}

interface UserContextType {
  profile: ProfileData | null;
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
  const { data: profile, isLoading, error } = useFetchProfile();

  const value: UserContextType = {
    profile: profile && Object.keys(profile).length > 0 ? profile as ProfileData : null,
    isLoading,
    error: error ? String(error) : null,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 