import type { ColumnDef, Row } from '@tanstack/react-table'
import {
  MoreHorizontal,
  Mail,
  Flag,
  Trash2,
  User,
  Phone,
  Building,
  MapPin,
  MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'

import { useUpdateLeadStatus } from '@/api/queries/lead.query'
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
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip'
import type { ContactSubmission} from '@/types/lead';
import { ContactStatus } from '@/types/lead'


const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(dateString))
}

const getStatusBadge = (status: ContactStatus) => {
  switch (status) {
    case ContactStatus.NEW:
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100/80">
          <Flag className="mr-1 h-3 w-3" />
          New
        </Badge>
      )
    case ContactStatus.CONTACTED:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80">
          <Mail className="mr-1 h-3 w-3" />
          Contacted
        </Badge>
      )
    case ContactStatus.SPAM:
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100/80">
          <Trash2 className="mr-1 h-3 w-3" />
          Spam
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const LeadActionsCell = ({ row }: { row: Row<ContactSubmission> }) => {
  const lead = row.original
  const updateStatusMutation = useUpdateLeadStatus()

  const handleStatusUpdate = (status: ContactStatus) => {
    const promise = updateStatusMutation.mutateAsync({ id: lead.id, status })
    toast.promise(promise, {
      loading: 'Updating status...',
      success: `Lead marked as ${status}.`,
      error: (err) => `Error: ${err.message}`
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleStatusUpdate(ContactStatus.CONTACTED)}>
          Mark as Contacted
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => handleStatusUpdate(ContactStatus.SPAM)}
        >
          Mark as Spam
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => window.open(`mailto:${lead.email}`, '_blank')}>
          Send Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const leadColumns: ColumnDef<ContactSubmission>[] = [
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
    accessorKey: 'firstName',
    header: 'Contact',
    cell: ({ row }) => {
      const lead = row.original
      const fullName = `${lead.firstName} ${lead.lastName}`

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-pointer space-y-1">
                <p className="font-medium text-sm hover:underline">{fullName}</p>
                <p className="text-xs text-muted-foreground">{lead.email}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent className="p-3 bg-slate-900 border-slate-800 text-slate-100">
              <div className="space-y-2 text-sm">
                <div className="font-semibold border-b border-slate-700 pb-2 mb-2 text-slate-50">
                  Contact Details
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <User className="h-4 w-4 text-slate-400" />
                  <span>{fullName}</span>
                </div>
                {lead.companyName && (
                  <div className="flex items-center gap-2 text-slate-200">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span>{lead.companyName}</span>
                  </div>
                )}
                {lead.phoneNumber && (
                  <div className="flex items-center gap-2 text-slate-200">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{lead.phoneNumber}</span>
                  </div>
                )}
                {(lead.country || lead.postalCode) && (
                  <div className="flex items-center gap-2 text-slate-200">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{[lead.country, lead.postalCode].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  },
  // NEW: Company Column Added Back
  {
    accessorKey: 'companyName',
    header: 'Company',
    cell: ({ row }) => {
      const companyName = row.getValue('companyName') as string
      return (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm">
            {companyName || <span className="text-muted-foreground">N/A</span>}
          </p>
        </div>
      )
    }
  },
  // NEW: Location Column Added Back
  {
    id: 'location',
    header: 'Location',
    cell: ({ row }) => {
      const { country, postalCode } = row.original
      const location = [country, postalCode].filter(Boolean).join(', ')

      if (!location) {
        return <span className="text-sm text-muted-foreground">N/A</span>
      }

      return (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm">{location}</p>
        </div>
      )
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => getStatusBadge(row.getValue('status'))
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: ({ row }) => {
      const message = row.getValue('message') as string
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-start gap-2 cursor-pointer">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground max-w-[300px] truncate">{message}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent className="p-3 bg-slate-900 border-slate-800 text-slate-100 max-w-sm">
              <div className="font-semibold border-b border-slate-700 pb-2 mb-2 text-slate-50">
                Full Message
              </div>
              <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {message}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Submitted',
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as string
      return <p className="text-sm text-muted-foreground">{formatDate(createdAt)}</p>
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <LeadActionsCell row={row} />
  }
]
