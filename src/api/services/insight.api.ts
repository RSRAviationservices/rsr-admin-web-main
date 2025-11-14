// src/api/services/insight.api.ts

import apiClient from "../client";

import type { PaginatedResponse } from "@/types";
import type {
  Insight,
  CreateInsightDto,
  UpdateInsightDto,
  InsightFilters,
  InsightStats,
} from "@/types/insight";

export const insightApi = {
  // Get all insights with filters (admin)
  async getAll(filters?: InsightFilters): Promise<PaginatedResponse<Insight>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.categoryId) params.append("categoryId", filters.categoryId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.tag) params.append("tag", filters.tag);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    return await apiClient.get(`/admin/insights?${params.toString()}`);
  },

  // Get insight by ID
  async getById(id: string): Promise<{ data: Insight }> {
    return await apiClient.get(`/admin/insights/${id}`);
  },

  // Get insight statistics
  async getStats(): Promise<{ data: InsightStats }> {
    return await apiClient.get("/admin/insights/stats");
  },

  // Create insight
  async create(
    data: CreateInsightDto
  ): Promise<{ data: Insight; message: string }> {
    return await apiClient.post("/admin/insights", data);
  },

  // Update insight
  async update(
    id: string,
    data: UpdateInsightDto
  ): Promise<{ data: Insight; message: string }> {
    return await apiClient.put(`/admin/insights/${id}`, data);
  },

  // Delete insight
  async delete(id: string): Promise<{ message: string }> {
    return await apiClient.delete(`/admin/insights/${id}`);
  },

  // Get all unique tags
  async getTags(): Promise<{ data: string[] }> {
    return await apiClient.get("/admin/insights/tags");
  },
};
