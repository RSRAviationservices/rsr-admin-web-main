import type { ColumnDef, Row } from '@tanstack/react-table'
import {
  MoreHorizontal,
  Mail,
  FileText,
  Chrome,
  Ban,
  CheckCircle,
  AlertCircle,
  Calendar,
  Phone
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { useUpdateUserSuspension } from '@/api/queries/user.query'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import type { User } from '@/types/user';
import { AuthProvider } from '@/types/user'


const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(dateString))
}

const getStatusBadge = (isSuspended: boolean, isEmailVerified: boolean) => {
  if (isSuspended) {
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100/80">
        <Ban className="mr-1 h-3 w-3" />
        Suspended
      </Badge>
    )
  }
  if (!isEmailVerified) {
    return (
      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100/80">
        <AlertCircle className="mr-1 h-3 w-3" />
        Unverified
      </Badge>
    )
  }
  return (
    <Badge className="bg-green-100 text-green-800 hover:bg-green-100/80">
      <CheckCircle className="mr-1 h-3 w-3" />
      Active
    </Badge>
  )
}

const UserActionsCell = ({ row }: { row: Row<User> }) => {
  const user = row.original
  const mutation = useUpdateUserSuspension()

  const handleSuspension = (isSuspended: boolean) => {
    const promise = mutation.mutateAsync({ id: user.id, isSuspended })
    toast.promise(promise, {
      loading: 'Updating user status...',
      success: `User has been ${isSuspended ? 'suspended' : 'activated'}.`,
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
        <DropdownMenuItem onClick={() => window.open(`mailto:${user.email}`, '_blank')}>
          Send Email
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user.isSuspended ? (
          <DropdownMenuItem className="text-green-600" onClick={() => handleSuspension(false)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Activate User
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem className="text-red-600" onClick={() => handleSuspension(true)}>
            <Ban className="mr-2 h-4 w-4" />
            Suspend User
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const userColumns: ColumnDef<User>[] = [
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
    accessorKey: 'name',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-pointer space-y-1">
                <p className="font-medium text-sm hover:underline">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent className="p-3 bg-slate-900 border-slate-800 text-slate-100">
              <div className="space-y-2 text-sm">
                <div className="font-semibold border-b border-slate-700 pb-2 mb-2 text-slate-50">
                  User Details
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-2 text-slate-200">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{user.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-200">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Member since {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  },
  {
    accessorKey: 'isSuspended',
    header: 'Status',
    cell: ({ row }) => getStatusBadge(row.getValue('isSuspended'), row.original.isEmailVerified)
  },
  {
    accessorKey: 'authProvider',
    header: 'Auth Method',
    cell: ({ row }) => {
      const provider = row.getValue('authProvider') as AuthProvider
      const Icon = provider === AuthProvider.GOOGLE ? Chrome : Mail
      return (
        <Badge variant="outline" className="text-xs capitalize">
          <Icon className="mr-1 h-3 w-3" />
          {provider}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'totalQuotes',
    header: 'Quotes',
    cell: ({ row }) => {
      const user = row.original
      if (user.totalQuotes === 0) {
        return <span className="text-sm text-muted-foreground">No quotes</span>
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm hover:underline">
                  {user.totalQuotes} Quotes
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="p-3 bg-slate-900 border-slate-800 text-slate-100">
              <div className="space-y-2">
                <div className="font-semibold border-b border-slate-700 pb-2 mb-2 text-slate-50">
                  Recent Quotes
                </div>
                <div className="flex flex-col gap-2">
                  {user.recentQuoteNumbers.map((quote) => (
                    <Link key={quote.id} to={`/quotes/${quote.id}`}>
                      <Badge
                        variant="outline"
                        className="font-mono text-xs bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
                      >
                        {quote.quoteNumber}
                      </Badge>
                    </Link>
                  ))}
                  {user.totalQuotes > 3 && (
                    <span className="text-xs text-slate-400">
                      ...and {user.totalQuotes - 3} more
                    </span>
                  )}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  },
  {
    accessorKey: 'lastLogin',
    header: 'Last Login',
    cell: ({ row }) => (
      <p className="text-sm text-muted-foreground">{formatDate(row.getValue('lastLogin'))}</p>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => <UserActionsCell row={row} />
  }
]
