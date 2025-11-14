import apiClient from "../client";
import type { AssetUploadResponse, AssetContext } from "@/types/asset";

export const assetApi = {
  // Upload single image
  async uploadImage(
    file: File,
    context: AssetContext,
    contextId?: string
  ): Promise<AssetUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const url = contextId
      ? `/assets/upload/image/${context}/${contextId}`
      : `/assets/upload/image/${context}`;

    return await apiClient.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
  },

  // Upload multiple images
  async uploadImages(
    files: File[],
    context: AssetContext,
    contextId?: string
  ): Promise<AssetUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const url = contextId
      ? `/assets/upload/images/${context}/${contextId}`
      : `/assets/upload/images/${context}`;

    return await apiClient.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
  },

  // Upload single document
  async uploadDocument(
    file: File,
    context: AssetContext,
    contextId?: string
  ): Promise<AssetUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const url = contextId
      ? `/assets/upload/document/${context}/${contextId}`
      : `/assets/upload/document/${context}`;

    return await apiClient.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
  },

  // Upload multiple documents
  async uploadDocuments(
    files: File[],
    context: AssetContext,
    contextId?: string
  ): Promise<AssetUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const url = contextId
      ? `/assets/upload/documents/${context}/${contextId}`
      : `/assets/upload/documents/${context}`;

    return await apiClient.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
  },

  // Delete single file
  async deleteFile(fileUrl: string): Promise<{ message: string }> {
    return await apiClient.delete("/assets/delete", {
      data: { fileUrl },
    });
    
  },

  // Delete multiple files
  async deleteMultipleFiles(fileUrls: string[]): Promise<{ message: string }> {
    return await apiClient.delete("/assets/delete-multiple", {
      data: { fileUrls },
    });
    
  },
};
