export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google'
}

interface UserQuote {
  id: string
  quoteNumber: string
}

export interface User {
  id: string
  email: string
  name: string
  phoneNumber?: string
  authProvider: AuthProvider
  isEmailVerified: boolean
  isSuspended: boolean
  lastLogin?: string
  createdAt: string
  totalQuotes: number
  quotes: UserQuote[]
  recentQuoteNumbers: UserQuote[]
}

export interface AdminUsersQueryDto {
  page?: number
  limit?: number
  search?: string
  authProvider?: AuthProvider
  isSuspended?: boolean
  isEmailVerified?: boolean
}
