import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  User,
  Mail,
  Phone,
  Edit,
  ChevronDown
} from 'lucide-react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useGetQuoteById, useUpdateQuote } from '@/api/queries/quote.query'
import { FormBreadcrumb } from '@/components/common/FormBreadcrumb'
import PageHeader from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import PageLayout from '@/layouts/PageLayout'
import { QuoteStatus } from '@/types/quote'

const getStatusInfo = (status: QuoteStatus) => {
  const statusConfig = {
    [QuoteStatus.PENDING]: {
      icon: Clock,
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800'
    },
    [QuoteStatus.APPROVED]: {
      icon: CheckCircle,
      label: 'Approved',
      className: 'bg-blue-100 text-blue-800'
    },
    [QuoteStatus.REJECTED]: {
      icon: XCircle,
      label: 'Rejected',
      className: 'bg-red-100 text-red-800'
    },
    [QuoteStatus.FULFILLED]: {
      icon: Package,
      label: 'Fulfilled',
      className: 'bg-green-100 text-green-800'
    }
  }
  return (
    statusConfig[status] || {
      icon: Clock,
      label: 'Unknown',
      className: 'bg-gray-100 text-gray-800'
    }
  )
}

export default function QuoteDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: response, isLoading, isError } = useGetQuoteById(id || '')
  const updateQuoteMutation = useUpdateQuote()

  const quote = response?.data

  const handleStatusUpdate = (status: QuoteStatus) => {
    if (!quote) return
    const promise = updateQuoteMutation.mutateAsync({ id: quote.id, data: { status } })
    toast.promise(promise, {
      loading: 'Updating status...',
      success: `Quote #${quote.quoteNumber} marked as ${status}.`,
      error: (err) => `Error: ${err.message}`
    })
  }

  if (isLoading) {
    return <PageSkeleton />
  }

  if (isError || !quote) {
    return (
      <div>
        <PageHeader title="Error" description="Could not load quote details." />
        <PageLayout>
          <p className="text-center text-red-500">
            There was a problem fetching the quote. Please go back and try again.
          </p>
        </PageLayout>
      </div>
    )
  }

  const statusInfo = getStatusInfo(quote.status)
  const StatusIcon = statusInfo.icon

  return (
    <div>
      <PageHeader
        title={`Quote #${quote.quoteNumber}`}
        description={`Details for quote request submitted on ${new Date(quote.createdAt).toLocaleDateString()}`}
      />
      <PageLayout>
        <div className="max-w-4xl mx-auto py-8">
          <FormBreadcrumb
            items={[{ label: 'Quotes', href: '/quotes' }]}
            currentPage={`#${quote.quoteNumber}`}
          />

          <div className="bg-white dark:bg-slate-900/50 p-8 rounded-lg shadow-sm space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  Quote Details
                </h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Requested: {new Date(quote.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Badge variant="secondary" className={statusInfo.className}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Update Status
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleStatusUpdate(QuoteStatus.APPROVED)}>
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusUpdate(QuoteStatus.FULFILLED)}>
                    Fulfill
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={() => handleStatusUpdate(QuoteStatus.REJECTED)}
                  >
                    Reject
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Separator />

            {/* Customer & Items Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                  Customer Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" /> {quote.customerInfo.name}
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" /> {quote.customerInfo.email}
                  </div>
                  {quote.customerInfo.phoneNumber && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />{' '}
                      {quote.customerInfo.phoneNumber}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">Admin Notes</h3>
                <p className="text-sm text-muted-foreground p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md min-h-[80px]">
                  {quote.adminNotes || 'No admin notes for this quote.'}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">
                Quoted Items ({quote.items.length})
              </h3>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quote.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.product.partNumber}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.product.brand}
                        </TableCell>
                        <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {quote.customerNotes && (
              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">Customer Notes</h3>
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap border p-4 rounded-md bg-slate-50 dark:bg-slate-800/50">
                  {quote.customerNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      </PageLayout>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div>
      <PageHeader title="Loading Quote..." description="Please wait while we fetch the details." />
      <PageLayout>
        <div className="max-w-4xl mx-auto py-8">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="bg-white dark:bg-slate-900/50 p-8 rounded-lg shadow-sm space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-80" />
              </div>
              <Skeleton className="h-10 w-40" />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </PageLayout>
    </div>
  )
}
