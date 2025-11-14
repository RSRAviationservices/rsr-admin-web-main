import { useState, useRef, useCallback } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadImage, useDeleteAsset } from "@/api/queries/asset.query";
import { useAssetStore } from "@/store/assetStore";
import type { AssetContext } from "@/types/asset";
import { AssetType } from "@/types/asset";
import { toast } from "sonner";
import * as React from "react";

interface ImageUploadProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  context: AssetContext;
  contextId?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  gridSize?: number;
  className?: string;
  disabled?: boolean;
  layout?: "grid" | "cover";
}

export function ImageUpload({
  value,
  onChange,
  context,
  contextId,
  multiple = false,
  maxFiles = 10,
  maxSize = 5,
  gridSize = 200,
  className,
  disabled = false,
  layout = "grid",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadImage();
  const deleteMutation = useDeleteAsset();
  const addUpload = useAssetStore((state) => state.addUpload);
  const removeUpload = useAssetStore((state) => state.removeUpload);

  const urls = React.useMemo(
    () => (Array.isArray(value) ? value : value ? [value] : []),
    [value]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      if (files.length === 0) return;

      // Validate file count
      if (multiple && urls.length + files.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} images allowed`);
        return;
      }

      if (!multiple && files.length > 1) {
        toast.error("Only one image allowed");
        return;
      }

      // Validate file sizes
      const oversizedFiles = files.filter(
        (file) => file.size > maxSize * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        toast.error(`Images must be less than ${maxSize}MB`);
        return;
      }

      // Validate file types
      const invalidFiles = files.filter(
        (file) => !file.type.startsWith("image/")
      );
      if (invalidFiles.length > 0) {
        toast.error("Only image files are allowed");
        return;
      }

      try {
        if (multiple) {
          // Upload multiple files with individual toasts
          const uploadPromises = files.map(async (file) => {
            const fileId = `${file.name}-${Date.now()}`;
            setUploading((prev) => ({ ...prev, [fileId]: true }));

            try {
              const result = await uploadMutation.mutateAsync({
                file,
                context,
                contextId,
              });

              if (result.data.url) {
                addUpload(result.data.url, AssetType.IMAGE, context);
                toast.success(`${file.name} uploaded successfully`);
                return result.data.url;
              }
              return null;
            } catch (error: any) {
              toast.error(
                error.response?.data?.error?.message ||
                  `Failed to upload ${file.name}`
              );
              return null;
            } finally {
              setUploading((prev) => {
                const newState = { ...prev };
                delete newState[fileId];
                return newState;
              });
            }
          });

          const results = await Promise.all(uploadPromises);
          const newUrls = results.filter((url): url is string => url !== null);

          if (newUrls.length > 0) {
            onChange([...urls, ...newUrls]);
          }
        } else {
          // Upload single file
          const file = files[0];
          const fileId = `${file.name}-${Date.now()}`;
          setUploading({ [fileId]: true });

          try {
            const result = await uploadMutation.mutateAsync({
              file,
              context,
              contextId,
            });

            if (result.data.url) {
              addUpload(result.data.url, AssetType.IMAGE, context);
              toast.success(`${file.name} uploaded successfully`);
              onChange(result.data.url);
            }
          } catch (error: any) {
            toast.error(
              error.response?.data?.error?.message ||
                `Failed to upload ${file.name}`
            );
          } finally {
            setUploading({});
          }
        }
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [
      multiple,
      urls,
      maxFiles,
      maxSize,
      context,
      contextId,
      onChange,
      uploadMutation,
      addUpload,
    ]
  );

  const handleRemove = useCallback(
    async (urlToRemove: string) => {
      try {
        await deleteMutation.mutateAsync(urlToRemove);
        toast.success("Image deleted successfully");

        removeUpload(urlToRemove);

        if (multiple) {
          onChange(urls.filter((url) => url !== urlToRemove));
        } else {
          onChange("");
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.error?.message || "Failed to delete image"
        );
        console.error("Delete error:", error);
      }
    },
    [multiple, urls, onChange, deleteMutation, removeUpload]
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const isUploading = Object.keys(uploading).length > 0;
  const canAddMore = multiple ? urls.length < maxFiles : urls.length === 0;
  const isCoverLayout = layout === "cover" && !multiple;

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
      {isCoverLayout ? (
        <div className="w-full">
          {urls.length > 0 ? (
            <div
              className="relative w-full rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 hover:border-gray-300 transition-colors"
              style={{ height: `${gridSize}px` }}
            >
              <img
                src={urls[0]}
                alt="Cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => handleRemove(urls[0])}
                disabled={disabled || isUploading || deleteMutation.isPending}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 shadow-lg transition-colors"
                aria-label="Remove image"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={disabled || isUploading}
              className="relative w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ height: `${gridSize}px` }}
            >
              {isUploading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                  <p className="mt-2 text-xs text-gray-500">Uploading...</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Plus className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Upload Cover Image
                  </p>
                  <p className="text-xs text-gray-400">Click to select</p>
                </div>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Existing Images */}
          {urls.map((url, index) => (
            <div
              key={url}
              className="relative group rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 hover:border-gray-300 transition-colors"
              style={{
                width: `${gridSize}px`,
                height: `${gridSize}px`,
              }}
            >
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    const icon = document.createElement("div");
                    icon.className =
                      "absolute inset-0 flex items-center justify-center";
                    icon.innerHTML =
                      '<svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
                    parent.appendChild(icon);
                  }
                }}
              />

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemove(url)}
                disabled={disabled || isUploading || deleteMutation.isPending}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 shadow-lg"
                aria-label="Remove image"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}

          {/* Add More Button (Square with Plus) */}
          {canAddMore && (
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={disabled || isUploading}
              className="relative rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                width: `${gridSize}px`,
                height: `${gridSize}px`,
              }}
            >
              {isUploading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                  <p className="mt-2 text-xs text-gray-500">Uploading...</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Plus className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-xs text-gray-500">
                    {multiple ? "Add Image" : "Upload Image"}
                  </p>
                </div>
              )}
            </button>
          )}
        </div>
      )}
      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        {multiple
          ? `Upload up to ${maxFiles} images (${urls.length}/${maxFiles}). Max ${maxSize}MB each.`
          : `Upload one image. Max ${maxSize}MB.`}
      </p>
    </div>
  );
}
