import apiClient from '../client'

import type { PaginatedResponse } from '@/types'
import type { AdminQuotesQueryDto, QuoteRequest, QuoteStatus } from '@/types/quote'

export const fetchQuotes = async (
  params: AdminQuotesQueryDto
): Promise<PaginatedResponse<QuoteRequest>> => {
  return apiClient.get('/admin/quotes', { params })
}

export const updateQuote = async ({
  id,
  data
}: {
  id: string
  data: { status?: QuoteStatus; adminNotes?: string }
}): Promise<{ data: QuoteRequest }> => {
  return apiClient.patch(`/admin/quotes/${id}`, data)
}

export const fetchQuoteById = async (id: string): Promise<{ data: QuoteRequest }> => {
  return apiClient.get(`/admin/quotes/${id}`)
}

export const deleteQuote = async (id: string): Promise<{ message: string }> => {
  return apiClient.delete(`/admin/quotes/${id}`)
}
