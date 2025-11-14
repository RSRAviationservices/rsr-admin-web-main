export enum LicenseStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  REVOKED = 'revoked'
}

export interface ActivationInfo {
  ipAddress: string
  userAgent: string
  hostname: string
}

// This type matches the data from the backend API
export interface License {
  id: string
  key: string
  deviceFingerprint?: string
  status: LicenseStatus
  activatedAt?: string | null
  activationInfo?: ActivationInfo | null
  notes?: string
  createdAt: string
  updatedAt: string
}

// DTO for sending query params to the API
export interface AdminLicensesQueryDto {
  page?: number
  limit?: number
  search?: string
  status?: LicenseStatus
}
