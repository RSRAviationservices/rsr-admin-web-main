// src/api/queries/application.query.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { applicationApi } from "../services/application.api";

import type {
  UpdateApplicationStatusDto,
  ApplicationFilters,
} from "@/types/application";

export const APPLICATION_KEYS = {
  all: ["applications"] as const,
  lists: () => [...APPLICATION_KEYS.all, "list"] as const,
  list: (filters?: ApplicationFilters) =>
    [...APPLICATION_KEYS.lists(), filters] as const,
  details: () => [...APPLICATION_KEYS.all, "detail"] as const,
  detail: (id: string) => [...APPLICATION_KEYS.details(), id] as const,
  byCareer: (careerId: string) =>
    [...APPLICATION_KEYS.all, "career", careerId] as const,
  stats: () => [...APPLICATION_KEYS.all, "stats"] as const,
};

// Get all applications
export function useApplications(filters?: ApplicationFilters) {
  return useQuery({
    queryKey: APPLICATION_KEYS.list(filters),
    queryFn: () => applicationApi.getAll(filters),
  });
}

// Get applications by career
export function useApplicationsByCareer(careerId: string) {
  return useQuery({
    queryKey: APPLICATION_KEYS.byCareer(careerId),
    queryFn: () => applicationApi.getByCareer(careerId),
    enabled: !!careerId,
  });
}

// Get application by ID
export function useApplication(id: string) {
  return useQuery({
    queryKey: APPLICATION_KEYS.detail(id),
    queryFn: () => applicationApi.getById(id),
    enabled: !!id,
  });
}

// Get application stats
export function useApplicationStats() {
  return useQuery({
    queryKey: APPLICATION_KEYS.stats(),
    queryFn: () => applicationApi.getStats(),
  });
}

// Update application status
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateApplicationStatusDto;
    }) => applicationApi.updateStatus(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: APPLICATION_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: APPLICATION_KEYS.stats() });
      toast.success(response.message || "Application status updated");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to update application"
      );
    },
  });
}

// Delete application
export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => applicationApi.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: APPLICATION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: APPLICATION_KEYS.stats() });
      toast.success(response.message || "Application deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to delete application"
      );
    },
  });
}
