import apiClient from '../client'

import type { PaginatedResponse } from '@/types/inventory'
import type { AdminLicensesQueryDto, License } from '@/types/license'

export const fetchLicenses = async (
  params: AdminLicensesQueryDto
): Promise<PaginatedResponse<License>> => {
  return apiClient.get('/admin/licenses', { params })
}

export const revokeLicense = async (id: string): Promise<{ data: License }> => {
  return apiClient.patch(`/admin/licenses/${id}/revoke`)
}

export const clearDeviceOnLicense = async (id: string): Promise<{ data: License }> => {
  return apiClient.patch(`/admin/licenses/${id}/clear-device`)
}
