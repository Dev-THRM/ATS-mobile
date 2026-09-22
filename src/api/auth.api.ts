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

  getOrganization: async (): Promise<any> => {
    const { data } = await apiClient.get('/auth/organization');
    return data;
  },

  updateOrganization: async (payload: {
    name?: string;
    slug?: string;
    website?: string;
    logoUrl?: string;
    sourcingChannels?: string[];
  }): Promise<any> => {
    const { data } = await apiClient.patch('/auth/organization', payload);
    return data;
  },

  uploadOrganizationLogo: async (formData: FormData): Promise<{ logoUrl: string }> => {
    const { data } = await apiClient.post<{ logoUrl: string }>('/auth/organization/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  forgotPassword: async (payload: {
    email: string;
    organizationSlug?: string;
  }): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>('/auth/forgot-password', payload);
    return data;
  },

  resetPassword: async (payload: {
    token: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>('/auth/reset-password', payload);
    return data;
  },
};
