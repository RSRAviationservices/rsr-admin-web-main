// --- Generic API Response Types ---
export interface ApiMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: ApiMeta
}

// --- Category Types ---
export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string | null
  subcategorySlugs: string[]
  productCount: number
  seoTitle?: string
  seoDescription?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// --- Product Sub-document Types ---
export interface ComplianceInfo {
  certifications: string[]
  hasCoC: boolean
  hasSDS: boolean
  hasTDS: boolean
  militarySpec?: string
}

export interface StorageInfo {
  temperatureControlled: boolean
  hazmat: boolean
  shelfLife?: string
  storageInstructions?: string
}

export interface AvailabilityInfo {
  status: 'in-stock' | 'limited' | 'lead-time' | 'quote-only'
  leadTime?: string
  minimumQuantity?: number
  allowAlternatives: boolean
}

export interface DocumentInfo {
  type: 'CoC' | 'SDS' | 'TDS' | 'Manual' | 'Spec Sheet'
  name: string
  url?: string
  description?: string
}

// --- Main Product Type ---
export interface Product {
  id: string
  slug: string
  name: string
  partNumber: string
  categorySlug: string
  subcategorySlug: string
  brand: string
  description: string
  images: string[]
  specifications: Record<string, string>
  compliance: ComplianceInfo
  storage: StorageInfo
  availability: AvailabilityInfo
  documents: DocumentInfo[]
  applications: string[]
  tags: string[]
  seoTitle?: string
  seoDescription?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// --- DTO for Product Query ---
export interface AdminProductsQueryDto {
  page?: number
  limit?: number
  search?: string
  categorySlug?: string
  brand?: string
  isActive?: boolean
}
