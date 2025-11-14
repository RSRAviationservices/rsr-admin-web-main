import {
  FileText,
  Hourglass,
  Target,
  TrendingUpIcon,
  TrendingDownIcon,
  UserPlus
} from 'lucide-react'

import { useGetKpis } from '@/api/queries/analytics.query'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const KpiSkeleton = () => (
  <Card className="shadow-none">
    <CardHeader>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-8 w-1/2 mt-2" />
    </CardHeader>
    <CardFooter>
      <Skeleton className="h-4 w-full" />
    </CardFooter>
  </Card>
)

export default function KpiCards() {
  const { data: response, isLoading, isError } = useGetKpis()
  const kpis = response?.data

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </div>
    )
  }

  if (isError || !kpis) {
    return <p className="text-red-500">Failed to load dashboard metrics.</p>
  }

  const isConversionUp = kpis.quoteConversion.change >= 0

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: New Quote Requests */}
      <Card className="@container/card shadow-none">
        <CardHeader className="relative">
          <CardDescription className="text-primary">New Quote Requests</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpis.newQuoteRequests.totalLast7Days}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              Today: {kpis.newQuoteRequests.today}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <FileText className="size-4 text-primary" /> New leads received
          </div>
          <div className="text-muted-foreground">Count from the last 7 days</div>
        </CardFooter>
      </Card>

      {/* Card 2: Pending Quotes */}
      <Card className="@container/card shadow-none">
        <CardHeader className="relative">
          <CardDescription className="text-primary">Pending Quotes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpis.pendingQuotes.total}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className="flex gap-1 rounded-lg text-xs font-semibold text-amber-600"
            >
              Action Required
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Hourglass className="size-4 text-primary" /> Awaiting approval
          </div>
          <div className="text-muted-foreground">Total open quotes to be acted on</div>
        </CardFooter>
      </Card>

      {/* Card 3: New User Signups */}
      <Card className="@container/card shadow-none">
        <CardHeader className="relative">
          <CardDescription className="text-primary">New User Signups</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpis.newUserSignups.totalLast7Days}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              Today: {kpis.newUserSignups.today}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <UserPlus className="size-4 text-primary" /> Growing user base
          </div>
          <div className="text-muted-foreground">New registrations in the last 7 days</div>
        </CardFooter>
      </Card>

      {/* Card 4: Quote Conversion Rate */}
      <Card className="@container/card shadow-none">
        <CardHeader className="relative">
          <CardDescription className="text-primary">Quote Conversion Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {kpis.quoteConversion.rate}%
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className={`flex gap-1 rounded-lg text-xs ${isConversionUp ? 'text-green-600' : 'text-red-600'}`}
            >
              {isConversionUp ? (
                <TrendingUpIcon className="size-3" />
              ) : (
                <TrendingDownIcon className="size-3" />
              )}
              {kpis.quoteConversion.change}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Target className="size-4 text-primary" /> Measuring effectiveness
          </div>
          <div className="text-muted-foreground">Based on quotes in the last 30 days</div>
        </CardFooter>
      </Card>
    </div>
  )
}
