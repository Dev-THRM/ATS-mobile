export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: {
    id: string;
    name: string;
    type: string;
    permissions: string[];
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    activePlans: string[];
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserSummary;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
  organizationSlug: string;
}

export interface OrganizationRole {
  id: string;
  name: string;
  type: string;
  description?: string;
  permissions?: string[];
  isCustom?: boolean;
}

export interface OrganizationMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  role: OrganizationRole;
}
