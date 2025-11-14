export interface KpiData {
  newQuoteRequests: {
    totalLast7Days: number
    today: number
  }
  pendingQuotes: {
    total: number
  }
  newUserSignups: {
    totalLast7Days: number
    today: number
  }
  quoteConversion: {
    rate: number
    change: number
  }
}

export interface VisitorDataPoint {
  date: string
  desktop: number
  mobile: number
}

export type TimeRange = '7d' | '30d' | '90d'
