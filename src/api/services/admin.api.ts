import apiClient from "../client";

import type {
  Admin,
  AdminAdminsQueryDto,
  AdminStatus,
  Permission,
  PermissionDefinition,
} from "@/types/admin";
import type { ApiResponse, PaginatedResponse } from "@/types";

export const fetchAdmins = async (
  params: AdminAdminsQueryDto
): Promise<PaginatedResponse<Admin>> => {
  return apiClient.get("/admin/admins", { params });
};

export const fetchAdminById = async (id: string): Promise<ApiResponse<Admin>> => {
  return apiClient.get(`/admin/admins/${id}`);
};

export const fetchPermissions = async (): Promise<PermissionDefinition[]> => {
  const response = await apiClient.get("/admin/permissions");
  // Extract the data array from { success, data: [...] }
  const data = extractData<PermissionDefinition[]>(response);
  return Array.isArray(data) ? data : [];
};

export const createAdmin = async (data: {
  username: string;
  fullName: string;
  email?: string;
  department?: string;
  password: string;
  role: string;
  status: string;
  permissions: Permission[];
}): Promise<ApiResponse<Admin>> => {
  return apiClient.post("/admin/admins", data);
};

export const updateAdmin = async ({
  id,
  data,
}: {
  id: string;
  data: {
    fullName?: string;
    email?: string;
    department?: string;
    password?: string;
    role?: string;
    status?: string;
    permissions?: Permission[];
  };
}): Promise<ApiResponse<Admin>> => {
  return apiClient.patch(`/admin/admins/${id}`, data);
};

export const updateAdminStatus = async ({
  id,
  status,
}: {
  id: string;
  status: AdminStatus;
}): Promise<Admin> => {
  return apiClient.patch(`/admin/admins/${id}/status`, { status });
};

export const deleteAdmin = async (id: string): Promise<{ message: string }> => {
  return apiClient.delete(`/admin/admins/${id}`);
};

// Helper to extract data from API response
const extractData = <T>(response: any): T => {
  if (response?.data !== undefined) {
    return response.data;
  }
  return response;
};
