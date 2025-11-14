// src/api/services/career.api.ts
import apiClient from "../client";

import type { PaginatedResponse } from "@/types";
import type {
  Career,
  CreateCareerDto,
  UpdateCareerDto,
  CareerFilters,
  CareerStats,
} from "@/types/career";

export const careerApi = {
  async getAll(filters?: CareerFilters): Promise<PaginatedResponse<Career>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.department) params.append("department", filters.department);
    if (filters?.location) params.append("location", filters.location);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    return await apiClient.get(`/admin/careers?${params.toString()}`);
  },

  // Get career by ID
  async getById(id: string): Promise<{ data: Career }> {
    return await apiClient.get(`/admin/careers/${id}`);
  },

  // Get career statistics
  async getStats(): Promise<{ data: CareerStats }> {
    return await apiClient.get("/admin/careers/stats");
  },

  // Create career
  async create(
    data: CreateCareerDto
  ): Promise<{ data: Career; message: string }> {
    return await apiClient.post("/admin/careers", data);
  },

  // Update career
  async update(
    id: string,
    data: UpdateCareerDto
  ): Promise<{ data: Career; message: string }> {
    return await apiClient.put(`/admin/careers/${id}`, data);
  },

  // Delete career
  async delete(id: string): Promise<{ message: string }> {
    return await apiClient.delete(`/admin/careers/${id}`);
  },
};
