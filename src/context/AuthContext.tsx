import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import { storeTokens, clearTokens, getAccessToken } from '../api/client';
import { UserSummary, LoginCredentials } from '../types/auth.types';

interface AuthContextType {
  user: UserSummary | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
        setIsLoading(false);
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
        isLoading,
        login,
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
