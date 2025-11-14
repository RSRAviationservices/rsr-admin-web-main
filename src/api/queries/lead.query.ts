import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchLeads, updateLeadStatus } from '../services/lead.api'

import type { AdminContactsQueryDto } from '@/types/lead'

export const LEAD_QUERY_KEYS = {
  leads: (params: AdminContactsQueryDto) => ['leads', params]
}

export const useGetLeads = (params: AdminContactsQueryDto) => {
  return useQuery({
    queryKey: LEAD_QUERY_KEYS.leads(params),
    queryFn: () => fetchLeads(params)
  })
}

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateLeadStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    }
  })
}
