import type { Product } from './inventory'

export enum QuoteStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FULFILLED = 'fulfilled'
}

export interface QuoteItem {
  product: Product // Product data is embedded
  quantity: number
}

export interface CustomerInfo {
  name: string
  email: string
  phoneNumber?: string
}

// This type matches the data coming from the backend API
export interface QuoteRequest {
  id: string
  quoteNumber: string
  status: QuoteStatus
  user: {
    // User is populated by the backend
    id: string
    firstName: string
    lastName: string
    email: string
  }
  customerInfo: CustomerInfo
  items: QuoteItem[]
  customerNotes?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

// This DTO is for sending query params to the API
export interface AdminQuotesQueryDto {
  page?: number
  limit?: number
  search?: string
  status?: QuoteStatus
}
