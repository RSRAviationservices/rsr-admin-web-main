import apiClient from '../client'

import type { PaginatedResponse } from '@/types'
import type { AdminUsersQueryDto, User } from '@/types/user'

export const fetchUsers = async (params: AdminUsersQueryDto): Promise<PaginatedResponse<User>> => {
  return apiClient.get('/admin/users', { params })
}

export const updateUserSuspension = async ({
  id,
  isSuspended
}: {
  id: string
  isSuspended: boolean
}): Promise<{ data: User }> => {
  return apiClient.patch(`/admin/users/${id}/suspension`, { isSuspended })
}
