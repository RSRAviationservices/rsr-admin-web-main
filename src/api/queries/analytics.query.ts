import { useQuery } from '@tanstack/react-query'

import { fetchKpis, fetchVisitorsChartData } from '../services/analytics.api'

import type { TimeRange } from '@/types/analytics'

export const ANALYTICS_QUERY_KEYS = {
  kpis: () => ['analytics', 'kpis'],
  visitors: (timeRange: TimeRange) => ['analytics', 'visitors', timeRange]
}

export const useGetKpis = () => {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.kpis(),
    queryFn: fetchKpis
  })
}

export const useGetVisitorsChartData = (timeRange: TimeRange) => {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.visitors(timeRange),
    queryFn: () => fetchVisitorsChartData(timeRange)
  })
}
