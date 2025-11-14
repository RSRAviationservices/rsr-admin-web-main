import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  fetchCategories,
  fetchCategoryById,
  fetchProductById,
  fetchProducts,
  updateCategory,
  updateProduct,
} from '../services/inventory.api';

import type { AdminProductsQueryDto } from '@/types/inventory';
import { toast } from 'sonner';

export const INVENTORY_QUERY_KEYS = {
  products: (params: AdminProductsQueryDto) => ['products', params],
  productById: (id: string) => ['product', id],
  categories: () => ['categories'],
  categoryById: (id: string) => ['category', id],
};

// === Product Queries & Mutations ===
export const useGetProducts = (params: AdminProductsQueryDto) => {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.products(params),
    queryFn: () => fetchProducts(params),
  });
};

export const useGetProductById = (id: string) => {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.productById(id),
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.productById(variables.id) });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    },
  });
};

// === Category Queries & Mutations ===
export const useGetCategories = () => {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.categories(),
    queryFn: fetchCategories,
  });
};

export const useGetCategoryById = (id: string) => {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.categoryById(id),
    queryFn: () => fetchCategoryById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.categoryById(variables.id) });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    },
  });
};
