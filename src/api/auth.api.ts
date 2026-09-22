import { apiClient } from './client';
import {
  AuthResponse,
  LoginCredentials,
  UserSummary,
  OrganizationMember,
  OrganizationRole,
} from '../types/auth.types';

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

  getOrganizationMembers: async (): Promise<OrganizationMember[]> => {
    const { data } = await apiClient.get<OrganizationMember[]>('/auth/organization/members');
    return data;
  },

  getOrganizationRoles: async (): Promise<OrganizationRole[]> => {
    const { data } = await apiClient.get<OrganizationRole[]>('/auth/organization/roles');
    return data;
  },

  addOrganizationMember: async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    roleId: string;
    password?: string;
    phone?: string;
  }): Promise<OrganizationMember> => {
    const { data } = await apiClient.post<OrganizationMember>('/auth/organization/members', payload);
    return data;
  },

  updateOrganizationMember: async (
    id: string,
    payload: {
      roleId?: string;
      isActive?: boolean;
      firstName?: string;
      lastName?: string;
      phone?: string;
    },
  ): Promise<OrganizationMember> => {
    const { data } = await apiClient.patch<OrganizationMember>(
      `/auth/organization/members/${id}`,
      payload,
    );
    return data;
  },

  removeOrganizationMember: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(
      `/auth/organization/members/${id}`,
    );
    return data;
  },
};
