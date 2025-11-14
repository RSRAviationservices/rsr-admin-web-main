import type { ColumnDef, Row } from '@tanstack/react-table'
import { MoreHorizontal, Clock, CheckCircle, XCircle, Package, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useUpdateQuote } from '@/api/queries/quote.query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import type { QuoteItem, QuoteRequest} from '@/types/quote';
import { QuoteStatus } from '@/types/quote'


const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(dateString))
}

const getStatusBadge = (status: QuoteStatus) => {
  const statusConfig = {
    [QuoteStatus.PENDING]: {
      icon: Clock,
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80'
    },
    [QuoteStatus.APPROVED]: {
      icon: CheckCircle,
      label: 'Approved',
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80'
    },
    [QuoteStatus.REJECTED]: {
      icon: XCircle,
      label: 'Rejected',
      className: 'bg-red-100 text-red-800 hover:bg-red-100/80'
    },
    [QuoteStatus.FULFILLED]: {
      icon: Package,
      label: 'Fulfilled',
      className: 'bg-green-100 text-green-800 hover:bg-green-100/80'
    }
  }
  const config = statusConfig[status] || {
    icon: Clock,
    label: 'Unknown',
    className: 'bg-gray-100 text-gray-800'
  }
  const Icon = config.icon

  return (
    <Badge variant="secondary" className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  )
}

// Dedicated component for actions to use hooks correctly
const QuoteActionsCell = ({ row }: { row: Row<QuoteRequest> }) => {
  const quote = row.original
  const updateQuoteMutation = useUpdateQuote()

  const handleStatusUpdate = (status: QuoteStatus) => {
    const promise = updateQuoteMutation.mutateAsync({ id: quote.id, data: { status } })
    toast.promise(promise, {
      loading: 'Updating status...',
      success: `Quote #${quote.quoteNumber} marked as ${status}.`,
      error: (err) => `Error: ${err.message}`
    })
  }
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigate(`/quotes/${quote.id}`)}>
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleStatusUpdate(QuoteStatus.APPROVED)}>
          Mark as Approved
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusUpdate(QuoteStatus.FULFILLED)}>
          Mark as Fulfilled
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => handleStatusUpdate(QuoteStatus.REJECTED)}
        >
          Mark as Rejected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const quoteColumns: ColumnDef<QuoteRequest>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'quoteNumber',
    header: 'Quote #',
    cell: ({ row }) => (
      <code className="font-mono text-sm font-semibold">{row.getValue('quoteNumber')}</code>
    )
  },
  {
    accessorKey: 'customerInfo',
    header: 'Customer',
    cell: ({ row }) => {
      const customerInfo = row.original.customerInfo
      return (
        <div>
          <p className="font-medium text-sm">{customerInfo.name}</p>
          <p className="text-xs text-muted-foreground">{customerInfo.email}</p>
        </div>
      )
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => getStatusBadge(row.getValue('status')),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'items',
    header: 'Items',
    cell: ({ row }) => {
      const items = row.getValue('items') as QuoteItem[]
      return (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{items.length} items</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Requested',
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as string
      return (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm">{formatDate(createdAt)}</p>
        </div>
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <QuoteActionsCell row={row} />
  }
]
