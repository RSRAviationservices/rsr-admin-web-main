export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown> | null;
  error?: {
    code?: string | number;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  path: string;
}

export * from "./admin";
export * from "./analytics";
export * from "./inventory";
export * from "./lead";
export * from "./quote";
export * from "./user";
export * from "./career"; // Add
export * from "./application"; // Add
export * from './insight'; // Add this
export * from './asset';
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}
