import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  fetchAdmins,
  fetchAdminById,
  fetchPermissions,
  updateAdminStatus,
  createAdmin,
  updateAdmin,
} from "../services/admin.api";

import type { AdminAdminsQueryDto } from "@/types/admin";

export const ADMIN_QUERY_KEYS = {
  admins: (params: AdminAdminsQueryDto) => ["admins", params],
  adminById: (id: string) => ["admin", id],
  permissions: () => ["admin", "permissions"],
};

export const useGetAdmins = (params: AdminAdminsQueryDto) => {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.admins(params),
    queryFn: () => fetchAdmins(params),
  });
};

export const useGetAdminById = (id: string) => {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.adminById(id),
    queryFn: () => fetchAdminById(id),
    enabled: !!id,
  });
};

export const useGetPermissions = () => {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.permissions(),
    queryFn: fetchPermissions,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdmin,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.adminById(variables.id),
      });
    },
  });
};

export const useUpdateAdminStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin status updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update admin status"
      );
    },
  });
};
