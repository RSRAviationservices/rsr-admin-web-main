import apiClient from '../client'

import type { KpiData, TimeRange, VisitorDataPoint } from '@/types/analytics'

export const fetchKpis = async (): Promise<{ data: KpiData }> => {
  return apiClient.get('/admin/analytics/kpis')
}

export const fetchVisitorsChartData = async (
  timeRange: TimeRange
): Promise<{ data: VisitorDataPoint[] }> => {
  return apiClient.get('/admin/analytics/visitors', { params: { timeRange } })
}
