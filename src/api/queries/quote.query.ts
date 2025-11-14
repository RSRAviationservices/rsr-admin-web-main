import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchQuoteById, fetchQuotes, updateQuote } from '../services/quote.api'

import type { AdminQuotesQueryDto } from '@/types/quote'

export const QUOTE_QUERY_KEYS = {
  quotes: (params: AdminQuotesQueryDto) => ['quotes', params],
  quoteById: (id: string) => ['quote', id]
}

export const useGetQuotes = (params: AdminQuotesQueryDto) => {
  return useQuery({
    queryKey: QUOTE_QUERY_KEYS.quotes(params),
    queryFn: () => fetchQuotes(params)
  })
}

export const useUpdateQuote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    }
  })
}

export const useGetQuoteById = (id: string) => {
  return useQuery({
    queryKey: QUOTE_QUERY_KEYS.quoteById(id),
    queryFn: () => fetchQuoteById(id),
    enabled: !!id
  })
}
