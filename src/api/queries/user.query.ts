import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchUsers, updateUserSuspension } from '../services/user.api'

import type { AdminUsersQueryDto } from '@/types/user'

export const USER_QUERY_KEYS = {
  users: (params: AdminUsersQueryDto) => ['users', params]
}

export const useGetUsers = (params: AdminUsersQueryDto) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.users(params),
    queryFn: () => fetchUsers(params)
  })
}

export const useUpdateUserSuspension = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateUserSuspension,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}
