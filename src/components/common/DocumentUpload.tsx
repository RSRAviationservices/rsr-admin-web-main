import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUploadDocument, useDeleteAsset } from "@/api/queries/asset.query";
import { useAssetStore } from "@/store/assetStore";
import type { AssetContext } from "@/types/asset";
import { AssetType } from "@/types/asset";
import { toast } from "sonner";
import * as React from "react";

interface DocumentUploadProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  context: AssetContext;
  contextId?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  accept?: string;
}

export function DocumentUpload({
  value,
  onChange,
  context,
  contextId,
  multiple = false,
  maxFiles = 5,
  maxSize = 10,
  className,
  disabled = false,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.txt",
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteAsset();
  const addUpload = useAssetStore((state) => state.addUpload);
  const removeUpload = useAssetStore((state) => state.removeUpload);

  const urls = React.useMemo(
    () => (Array.isArray(value) ? value : value ? [value] : []),
    [value]
  );

  const getFileName = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split("/").pop() || "document";
    } catch {
      return "document";
    }
  };

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      if (files.length === 0) return;

      if (multiple && urls.length + files.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} documents allowed`);
        return;
      }

      if (!multiple && files.length > 1) {
        toast.error("Only one document allowed");
        return;
      }

      const oversizedFiles = files.filter(
        (file) => file.size > maxSize * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        toast.error(`Documents must be less than ${maxSize}MB`);
        return;
      }

      setUploading(true);

      try {
        const uploadPromises = files.map(async (file) => {
          try {
            const result = await uploadMutation.mutateAsync({
              file,
              context,
              contextId,
            });

            if (result.data.url) {
              addUpload(result.data.url, AssetType.DOCUMENT, context);
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
          }
        });

        const results = await Promise.all(uploadPromises);
        const newUrls = results.filter((url): url is string => url !== null);

        if (newUrls.length > 0) {
          if (multiple) {
            onChange([...urls, ...newUrls]);
          } else {
            onChange(newUrls[0] || "");
          }
        }
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setUploading(false);
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
        toast.success("Document deleted successfully");

        removeUpload(urlToRemove);

        if (multiple) {
          onChange(urls.filter((url) => url !== urlToRemove));
        } else {
          onChange("");
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.error?.message || "Failed to delete document"
        );
        console.error("Delete error:", error);
      }
    },
    [multiple, urls, onChange, deleteMutation, removeUpload]
  );

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {(multiple || urls.length === 0) && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={
            disabled || uploading || (multiple && urls.length >= maxFiles)
          }
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {multiple
                ? `Upload Documents (${urls.length}/${maxFiles})`
                : "Upload Document"}
            </>
          )}
        </Button>
      )}

      {urls.length > 0 && (
        <div className="space-y-2">
          {urls.map((url) => (
            <div
              key={url}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate"
                >
                  {getFileName(url)}
                </a>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(url)}
                disabled={disabled || uploading || deleteMutation.isPending}
                className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        {multiple
          ? `Upload up to ${maxFiles} documents. Max ${maxSize}MB each.`
          : `Upload one document. Max ${maxSize}MB.`}
      </p>
    </div>
  );
}
