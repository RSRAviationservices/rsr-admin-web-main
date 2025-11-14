// src/api/queries/career.query.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { careerApi } from "../services/career.api";

import type {
  CreateCareerDto,
  UpdateCareerDto,
  CareerFilters,
} from "@/types/career";

export const CAREER_KEYS = {
  all: ["careers"] as const,
  lists: () => [...CAREER_KEYS.all, "list"] as const,
  list: (filters?: CareerFilters) => [...CAREER_KEYS.lists(), filters] as const,
  details: () => [...CAREER_KEYS.all, "detail"] as const,
  detail: (id: string) => [...CAREER_KEYS.details(), id] as const,
  stats: () => [...CAREER_KEYS.all, "stats"] as const,
};

// Get all careers
export function useCareers(filters?: CareerFilters) {
  return useQuery({
    queryKey: CAREER_KEYS.list(filters),
    queryFn: () => careerApi.getAll(filters),
  });
}

// Get career by ID
// Update this function
export function useCareer(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CAREER_KEYS.detail(id),
    queryFn: () => careerApi.getById(id),
    enabled: options?.enabled !== false && !!id,
  });
}

// Get career stats
export function useCareerStats() {
  return useQuery({
    queryKey: CAREER_KEYS.stats(),
    queryFn: () => careerApi.getStats(),
  });
}

// Create career
export function useCreateCareer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCareerDto) => careerApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CAREER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CAREER_KEYS.stats() });
      toast.success(response.message || "Career created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to create career"
      );
    },
  });
}

// Update career
export function useUpdateCareer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCareerDto }) =>
      careerApi.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: CAREER_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CAREER_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: CAREER_KEYS.stats() });
      toast.success(response.message || "Career updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to update career"
      );
    },
  });
}

// Delete career
export function useDeleteCareer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => careerApi.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CAREER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CAREER_KEYS.stats() });
      toast.success(response.message || "Career deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to delete career"
      );
    },
  });
}
