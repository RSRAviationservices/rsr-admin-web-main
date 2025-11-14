export enum AdminRole {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
}

export enum AdminStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export interface Permission {
  resource: string;
  actions: string[];
}

// Permission definition from backend
export interface PermissionDefinition {
  resource: string;
  actions: string[];
  description: string;
}

// Backend API response type
export interface Admin {
  id: string;
  username: string;
  role: AdminRole;
  status: AdminStatus;
  permissions?: Permission[];
  createdBy?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  createdByUsername?: string;
  permissionCount: number;
}

// DTO for sending query params to the API
export interface AdminAdminsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminStatus;
}

// Form data type
export interface AdminFormData {
  username: string;
  password?: string;
  confirmPassword?: string;
  role: AdminRole;
  status: AdminStatus;
  permissions: Permission[];
}
