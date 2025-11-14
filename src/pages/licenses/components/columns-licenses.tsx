import type { ColumnDef, Row } from '@tanstack/react-table'
import { MoreHorizontal, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import {
  useRevokeLicense,
  useClearDeviceOnLicense
} from '@/api/queries/license-management.query'
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
  TooltipTrigger,
  TooltipContent,
  Tooltip
} from '@/components/ui/tooltip'
import type { License} from '@/types/license';
import { LicenseStatus } from '@/types/license'


const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

const getStatusBadge = (status: LicenseStatus) => {
  switch (status) {
    case LicenseStatus.ACTIVE:
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Active
        </Badge>
      )
    case LicenseStatus.INACTIVE:
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Inactive
        </Badge>
      )
    case LicenseStatus.REVOKED:
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          <XCircle className="mr-1 h-3 w-3" />
          Revoked
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const LicenseActionsCell = ({ row }: { row: Row<License> }) => {
  const license = row.original
  const revokeMutation = useRevokeLicense()
  const clearDeviceMutation = useClearDeviceOnLicense()

  const handleRevoke = () => {
    const promise = revokeMutation.mutateAsync(license.id)
    toast.promise(promise, {
      loading: 'Revoking license...',
      success: 'License has been revoked.',
      error: (err) => `Error: ${err.message}`
    })
  }

  const handleClearDevice = () => {
    const promise = clearDeviceMutation.mutateAsync(license.id)
    toast.promise(promise, {
      loading: 'Clearing device...',
      success: 'Device has been cleared from license.',
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
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(license.key)}>
          Copy License Key
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleClearDevice}
          disabled={license.status !== LicenseStatus.ACTIVE}
        >
          Clear Device
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onClick={handleRevoke}
          disabled={license.status === LicenseStatus.REVOKED}
        >
          Revoke License
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const licenseColumns: ColumnDef<License>[] = [
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
    accessorKey: 'key',
    header: 'License Key',
    cell: ({ row }) => {
      const key = row.getValue('key') as string
      return <code className="font-mono text-sm font-semibold">{key}</code>
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => getStatusBadge(row.getValue('status'))
  },
  {
    accessorKey: 'activationInfo',
    header: 'Device',
    cell: ({ row }) => {
      const activationInfo = row.original.activationInfo
      const fingerprint = row.original.deviceFingerprint

      if (!activationInfo) {
        return <span className="text-muted-foreground">Not activated</span>
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-pointer">
                <p className="font-medium text-sm hover:underline">{activationInfo.hostname}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {activationInfo.ipAddress}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono text-xs">{fingerprint}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  },
  {
    accessorKey: 'activatedAt',
    header: 'Activated',
    cell: ({ row }) => (
      <p className="text-sm text-muted-foreground">{formatDate(row.getValue('activatedAt'))}</p>
    )
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }) => {
      const notes = row.getValue('notes') as string | undefined
      if (!notes) return <span className="text-muted-foreground">--</span>
      return <p className="text-sm max-w-[200px] truncate">{notes}</p>
    }
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    cell: ({ row }) => (
      <p className="text-sm text-muted-foreground">{formatDate(row.getValue('updatedAt'))}</p>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => <LicenseActionsCell row={row} />
  }
]
