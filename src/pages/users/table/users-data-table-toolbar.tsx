import type { Table } from '@tanstack/react-table'
import { X, Search, Ban } from 'lucide-react'

import { DataTableFacetedFilter } from '@/components/common/data-table-faceted-filter'
import { DataTableViewOptions } from '@/components/common/data-table-view-options'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthProvider } from '@/types/user'
import type { User } from '@/types/user';

const statusOptions = [
  { value: false, label: 'Active' },
  { value: true, label: 'Suspended' }
]

const authProviderOptions = [
  { value: AuthProvider.EMAIL, label: 'Email' },
  { value: AuthProvider.GOOGLE, label: 'Google' }
]

interface UsersDataTableToolbarProps {
  table: Table<User>
  onSuspend?: (ids: string[], suspend: boolean) => void
}

export function UsersDataTableToolbar({ table, onSuspend }: UsersDataTableToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, org..."
            value={table.getState().globalFilter ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-8 w-[200px] lg:w-[300px] pl-8"
          />
        </div>

        {table.getColumn('isSuspended') && (
          <DataTableFacetedFilter
            column={table.getColumn('isSuspended')}
            title="Status"
            options={statusOptions}
          />
        )}

        {table.getColumn('authProvider') && (
          <DataTableFacetedFilter
            column={table.getColumn('authProvider')}
            title="Auth Method"
            options={authProviderOptions}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter('')
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center space-x-2">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <>
              <Button
                variant="destructive"
                size="sm"
                className="h-8"
                onClick={() => {
                  const selectedRows = table.getFilteredSelectedRowModel().rows
                  const selectedIds = selectedRows.map((row) => row.original.id)
                  onSuspend?.(selectedIds, true)
                }}
              >
                <Ban className="mr-2 h-4 w-4" />
                Suspend ({table.getFilteredSelectedRowModel().rows.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => {
                  const selectedRows = table.getFilteredSelectedRowModel().rows
                  const selectedIds = selectedRows.map((row) => row.original.id)
                  onSuspend?.(selectedIds, false)
                }}
              >
                Unsuspend
              </Button>
            </>
          )}
        </div>
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
