// src/api/services/application.api.ts
import apiClient from "../client";

import type { PaginatedResponse } from "@/types";
import type {
  Application,
  UpdateApplicationStatusDto,
  ApplicationFilters,
  ApplicationStats,
} from "@/types/application";

export const applicationApi = {
  async getAll(
    filters?: ApplicationFilters
  ): Promise<PaginatedResponse<Application>> {
    const params = new URLSearchParams();
    if (filters?.careerId) params.append("careerId", filters.careerId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.department) params.append("department", filters.department);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params.append("dateTo", filters.dateTo);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    return await apiClient.get(`/admin/applications?${params.toString()}`);
  },

  // Get applications for a specific career
  async getByCareer(careerId: string): Promise<{
    data: {
      career: {
        id: string;
        title: string;
        department: string;
        applicationsCount: number;
      };
      applications: Application[];
    };
  }> {
    return await apiClient.get(`/admin/applications/career/${careerId}`);
  },

  // Get application by ID
  async getById(id: string): Promise<{ data: Application }> {
    return await apiClient.get(`/admin/applications/${id}`);
  },

  // Get application statistics
  async getStats(): Promise<{ data: ApplicationStats }> {
    return await apiClient.get("/admin/applications/stats");
  },

  // Update application status
  async updateStatus(
    id: string,
    data: UpdateApplicationStatusDto
  ): Promise<{ data: Application; message: string }> {
    return await apiClient.patch(`/admin/applications/${id}/status`, data);
  },

  // Delete application
  async delete(id: string): Promise<{ message: string }> {
    return await apiClient.delete(`/admin/applications/${id}`);
  },
};
