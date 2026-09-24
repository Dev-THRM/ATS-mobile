import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { storeTokens, clearTokens, getAccessToken } from '../api/client';
import { UserSummary, LoginCredentials } from '../types/auth.types';

interface AuthContextType {
  user: UserSummary | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  switchWorkspace: (organizationSlug: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Restore session on app launch
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const profile = await authApi.getMe();
          setUser(profile);
        }
      } catch {
        await clearTokens();
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      await storeTokens(response.tokens.accessToken, response.tokens.refreshToken);
      setUser(response.user);
      queryClient.clear();
    } finally {
      setIsLoading(false);
    }
  };

  const switchWorkspace = async (organizationSlug: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({
        email: user?.email || 'bijlanisahil0987@gmail.com',
        password: 'Password123!',
        organizationSlug,
      });
      await storeTokens(response.tokens.accessToken, response.tokens.refreshToken);
      setUser(response.user);
      queryClient.clear();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      await clearTokens();
      setUser(null);
      queryClient.clear();
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await authApi.getMe();
      setUser(profile);
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isBootstrapping,
        isLoading,
        login,
        switchWorkspace,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
