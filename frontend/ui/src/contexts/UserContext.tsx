import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  profile: {
    dateOfBirth?: string;
    phoneNumber?: string;
    address?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
}

interface UserContextType {
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<void>;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = () => {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        try {
          setProfile(JSON.parse(storedProfile));
        } catch (error) {
          console.error('Failed to parse stored profile:', error);
        }
      }
    };

    loadProfile();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      const updatedProfile = profile ? { ...profile, ...updates } : null;
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      }
    } catch (error) {
      setError('Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (preferences: Partial<UserProfile['preferences']>) => {
    if (!profile) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      const updatedProfile = {
        ...profile,
        preferences: { ...profile.preferences, ...preferences }
      };
      
      setProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    } catch (error) {
      setError('Failed to update preferences');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: UserContextType = {
    profile,
    updateProfile,
    updatePreferences,
    isLoading,
    error,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 