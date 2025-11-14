import { useMutation } from "@tanstack/react-query";
import { assetApi } from "../services/asset.api";
import type { AssetContext } from "@/types/asset";
import { toast } from "sonner";

export const ASSET_KEYS = {
  all: ["assets"] as const,
};

// Upload single image
export function useUploadImage() {
  return useMutation({
    mutationFn: ({
      file,
      context,
      contextId,
    }: {
      file: File;
      context: AssetContext;
      contextId?: string;
    }) => assetApi.uploadImage(file, context, contextId),
  });
}

// Upload multiple images
export function useUploadImages() {
  return useMutation({
    mutationFn: ({
      files,
      context,
      contextId,
    }: {
      files: File[];
      context: AssetContext;
      contextId?: string;
    }) => assetApi.uploadImages(files, context, contextId),
  });
}

// Upload single document
export function useUploadDocument() {
  return useMutation({
    mutationFn: ({
      file,
      context,
      contextId,
    }: {
      file: File;
      context: AssetContext;
      contextId?: string;
    }) => assetApi.uploadDocument(file, context, contextId),
  });
}

// Upload multiple documents
export function useUploadDocuments() {
  return useMutation({
    mutationFn: ({
      files,
      context,
      contextId,
    }: {
      files: File[];
      context: AssetContext;
      contextId?: string;
    }) => assetApi.uploadDocuments(files, context, contextId),
  });
}

// Delete file
export function useDeleteAsset() {
  return useMutation({
    mutationFn: (fileUrl: string) => assetApi.deleteFile(fileUrl),
    onSuccess: (response) => {
      toast.success(response.message || "File deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to delete file"
      );
    },
  });
}

// Delete multiple files
export function useDeleteMultipleAssets() {
  return useMutation({
    mutationFn: (fileUrls: string[]) => assetApi.deleteMultipleFiles(fileUrls),
    onSuccess: (response) => {
      toast.success(response.message || "Files deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to delete files"
      );
    },
  });
}
