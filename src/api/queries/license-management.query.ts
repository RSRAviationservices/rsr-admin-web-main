import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchLicenses,
  revokeLicense,
  clearDeviceOnLicense
} from '../services/license-management.api'

import type { AdminLicensesQueryDto } from '@/types/license'

export const LICENSE_QUERY_KEYS = {
  licenses: (params: AdminLicensesQueryDto) => ['licenses', params]
}

export const useGetLicenses = (params: AdminLicensesQueryDto) => {
  return useQuery({
    queryKey: LICENSE_QUERY_KEYS.licenses(params),
    queryFn: () => fetchLicenses(params)
  })
}

export const useRevokeLicense = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: revokeLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] })
    }
  })
}

export const useClearDeviceOnLicense = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: clearDeviceOnLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] })
    }
  })
}
