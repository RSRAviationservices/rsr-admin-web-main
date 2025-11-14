export enum AssetContext {
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  BLOGS = 'blogs',
  CAREERS = 'careers',
  RESUMES = 'resumes',
  GENERAL = 'general',
}

export enum AssetType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
}

export interface UploadedAsset {
  url: string;
  type: AssetType;
  context: AssetContext;
  uploadedAt: string;
}

export interface AssetUploadResponse {
  data: {
    url?: string;
    urls?: string[];
  };
  message: string;
}
