// src/api/queries/insight.query.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { insightApi } from "../services/insight.api";

import type {
  CreateInsightDto,
  UpdateInsightDto,
  InsightFilters,
} from "@/types/insight";

export const INSIGHT_KEYS = {
  all: ["insights"] as const,
  lists: () => [...INSIGHT_KEYS.all, "list"] as const,
  list: (filters?: InsightFilters) =>
    [...INSIGHT_KEYS.lists(), filters] as const,
  details: () => [...INSIGHT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...INSIGHT_KEYS.details(), id] as const,
  stats: () => [...INSIGHT_KEYS.all, "stats"] as const,
  tags: () => [...INSIGHT_KEYS.all, "tags"] as const,
};

// Get all insights
export function useInsights(filters?: InsightFilters) {
  return useQuery({
    queryKey: INSIGHT_KEYS.list(filters),
    queryFn: () => insightApi.getAll(filters),
  });
}

// Get insight by ID
export function useInsight(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: INSIGHT_KEYS.detail(id),
    queryFn: () => insightApi.getById(id),
    enabled: options?.enabled !== false && !!id,
  });
}

// Get insight stats
export function useInsightStats() {
  return useQuery({
    queryKey: INSIGHT_KEYS.stats(),
    queryFn: () => insightApi.getStats(),
  });
}

// Get all tags
export function useInsightTags() {
  return useQuery({
    queryKey: INSIGHT_KEYS.tags(),
    queryFn: () => insightApi.getTags(),
  });
}

// Create insight
export function useCreateInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInsightDto) => insightApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: INSIGHT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: INSIGHT_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: INSIGHT_KEYS.tags() });
      toast.success(response.message || "Insight created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to create insight"
      );
    },
  });
}

// Update insight
export function useUpdateInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInsightDto }) =>
      insightApi.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: INSIGHT_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: INSIGHT_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: INSIGHT_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: INSIGHT_KEYS.tags() });
      toast.success(response.message || "Insight updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to update insight"
      );
    },
  });
}

// Delete insight
export function useDeleteInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => insightApi.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: INSIGHT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: INSIGHT_KEYS.stats() });
      toast.success(response.message || "Insight deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to delete insight"
      );
    },
  });
}
