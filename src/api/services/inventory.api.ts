import apiClient from "../client";

import type {
  AdminProductsQueryDto,
  Category,
  PaginatedResponse,
  Product,
} from "@/types/inventory";

// === Product API Service ===
export const fetchProducts = async (
  params: AdminProductsQueryDto
): Promise<PaginatedResponse<Product>> => {
  return apiClient.get("/inventory/products", { params });
};

export const fetchProductById = async (id: string): Promise<Product> => {
  return apiClient.get(`/inventory/products/${id}`);
};

export const createProduct = async (data: Partial<Product>): Promise<Product> => {
  return apiClient.post("/inventory/products", data);
};

export const updateProduct = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Product>;
}): Promise<Product> => {
  return apiClient.patch(`/inventory/products/${id}`, data);
};

export const deleteProduct = async (id: string): Promise<{ message: string }> => {
  return apiClient.delete(`/inventory/products/${id}`);
};

// === Category API Service ===
export const fetchCategories = async (): Promise<Category[]> => {
  return apiClient.get("/inventory/categories");
};

export const fetchCategoryById = async (id: string): Promise<Category> => {
  return apiClient.get(`/inventory/categories/${id}`);
};

export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  return apiClient.post("/inventory/categories", data);
};

export const updateCategory = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Category>;
}): Promise<Category> => {
  return apiClient.patch(`/inventory/categories/${id}`, data);
};

export const deleteCategory = async (id: string): Promise<{ message: string }> => {
  return apiClient.delete(`/inventory/categories/${id}`);
};
