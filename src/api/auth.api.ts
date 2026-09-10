import { apiClient } from './client';
import { AuthResponse, LoginCredentials, UserSummary } from '../types/auth.types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  getMe: async (): Promise<UserSummary> => {
    const { data } = await apiClient.get<UserSummary>('/auth/me');
    return data;
  },

  logout: async (): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>('/auth/logout');
    return data;
  },

  checkSlug: async (slug: string): Promise<{ slug: string; available: boolean }> => {
    const { data } = await apiClient.get<{ slug: string; available: boolean }>('/auth/check-slug', {
      params: { slug },
    });
    return data;
  },
};
