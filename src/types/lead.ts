// This type matches the data coming from the backend API
export enum ContactStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  SPAM = 'spam'
}

export interface ContactSubmission {
  id: string
  firstName: string
  lastName: string
  companyName?: string
  email: string
  phoneNumber?: string
  postalCode?: string
  country?: string
  message: string
  status: ContactStatus
  createdAt: string
  updatedAt: string
}

// DTO for sending query params to the API
export interface AdminContactsQueryDto {
  page?: number
  limit?: number
  search?: string
  status?: ContactStatus
}
