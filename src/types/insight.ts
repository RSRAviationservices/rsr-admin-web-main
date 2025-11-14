// src/types/insight.ts
export enum InsightStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}

export interface Author {
  id: string;
  name: string;
  avatar?: string;
}

// Update the Insight interface
export interface Insight {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: any; // BlockNote blocks array - can be PartialBlock[] or stored as object
  coverImage: string;
  author: Author;
  categoryId: string;
  categoryName: string;
  tags: string[];
  status: InsightStatus;
  publishedAt?: string;
  views: number;
  readTime: number;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInsightDto {
  title: string;
  slug?: string;
  excerpt: string;
  content: any; // BlockNote blocks
  coverImage: string;
  categoryId: string;
  tags: string[];
  status: InsightStatus;
  publishedAt?: string;
  readTime: number;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface InsightCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateInsightDto extends Partial<CreateInsightDto> {}

export interface InsightFilters {
  search?: string;
  categoryId?: string;
  status?: InsightStatus;
  tag?: string;
  page?: number;
  limit?: number;
  sortBy?: "publishedAt" | "title" | "views" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface InsightStats {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
}

// Simple predefined categories for internal use only
export const INSIGHT_CATEGORIES = [
  {
    id: "technical",
    name: "Technical",
    description: "Technical articles and guides",
  },
  {
    id: "industry-news",
    name: "Industry News",
    description: "Aviation industry updates",
  },
  {
    id: "case-study",
    name: "Case Study",
    description: "Customer success stories",
  },
  {
    id: "company-news",
    name: "Company News",
    description: "Company announcements and updates",
  },
  {
    id: "best-practices",
    name: "Best Practices",
    description: "Industry best practices and tips",
  },
] as const;

export type InsightCategoryType = (typeof INSIGHT_CATEGORIES)[number]["id"];
