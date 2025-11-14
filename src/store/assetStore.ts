import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UploadedAsset, AssetType, AssetContext } from "@/types/asset";

interface AssetStore {
  // Recent uploads (for quick access)
  recentUploads: UploadedAsset[];

  // Actions
  addUpload: (url: string, type: AssetType, context: AssetContext) => void;
  removeUpload: (url: string) => void;
  clearRecentUploads: () => void;
  getRecentByContext: (context: AssetContext) => UploadedAsset[];
}

export const useAssetStore = create<AssetStore>()(
  persist(
    (set, get) => ({
      recentUploads: [],

      addUpload: (url, type, context) => {
        set((state) => ({
          recentUploads: [
            {
              url,
              type,
              context,
              uploadedAt: new Date().toISOString(),
            },
            ...state.recentUploads.slice(0, 49), // Keep last 50
          ],
        }));
      },

      removeUpload: (url) => {
        set((state) => ({
          recentUploads: state.recentUploads.filter(
            (asset) => asset.url !== url
          ),
        }));
      },

      clearRecentUploads: () => set({ recentUploads: [] }),

      getRecentByContext: (context) => {
        return get().recentUploads.filter((asset) => asset.context === context);
      },
    }),
    {
      name: "asset-storage",
    }
  )
);
