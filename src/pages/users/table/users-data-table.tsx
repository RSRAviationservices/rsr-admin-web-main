import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import * as React from 'react'


import { userColumns } from './columns-users'
import { UsersDataTableToolbar } from './users-data-table-toolbar'

import { useGetUsers } from '@/api/queries/user.query'
import { DataTablePagination } from '@/components/common/data-table-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useUpdateUserSuspension } from '@/api/queries/user.query'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'
import type { AuthProvider } from '@/types/user'

export function UsersDataTable() {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'createdAt', desc: true }])
  const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const debouncedSearch = useDebounce(globalFilter, 500)
  const isSuspendedFilter = columnFilters.find((f) => f.id === 'isSuspended')?.value as
    | boolean[]
    | undefined
  const authProviderFilter = columnFilters.find((f) => f.id === 'authProvider')?.value as
    | AuthProvider[]
    | undefined

  const queryParams = React.useMemo(() => {
    return {
      page: pageIndex + 1,
      limit: pageSize,
      search: debouncedSearch,
      isSuspended: isSuspendedFilter?.[0],
      authProvider: authProviderFilter?.[0]
    }
  }, [pageIndex, pageSize, debouncedSearch, isSuspendedFilter, authProviderFilter])

  const { data: response, isLoading, isError } = useGetUsers(queryParams)
  const data = response?.data ?? []
  const pageCount = response?.meta?.totalPages ?? 0

  const table = useReactTable({
    data,
    columns: userColumns,
    pageCount,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination: { pageIndex, pageSize }
    },
    enableRowSelection: true,
    manualPagination: true,
    manualFiltering: true,
    enableGlobalFilter: true,
    manualSorting: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel()
  })

  const suspendMutation = useUpdateUserSuspension()
  const [showSuspendDialog, setShowSuspendDialog] = React.useState(false)
  const [selectedIdsToSuspend, setSelectedIdsToSuspend] = React.useState<string[]>([])
  const [isSuspending, setIsSuspending] = React.useState(true) // true = suspend, false = unsuspend

  const handleBulkSuspend = (ids: string[], suspend: boolean) => {
    setSelectedIdsToSuspend(ids)
    setIsSuspending(suspend)
    setShowSuspendDialog(true)
  }

  const confirmSuspend = async () => {
    try {
      await Promise.all(
        selectedIdsToSuspend.map((id) =>
          suspendMutation.mutateAsync({ id, isSuspended: isSuspending })
        )
      )
      toast.success(
        `Successfully ${isSuspending ? 'suspended' : 'unsuspended'} ${selectedIdsToSuspend.length} users`
      )
      setRowSelection({})
    } catch (error) {
      toast.error(`Failed to ${isSuspending ? 'suspend' : 'unsuspend'} some users`)
    } finally {
      setShowSuspendDialog(false)
      setSelectedIdsToSuspend([])
    }
  }

  // Add a filter accessor for isSuspended to make the filter work
  React.useEffect(() => {
    table.getColumn('isSuspended')?.setFilterValue(isSuspendedFilter)
  }, [isSuspendedFilter, table])

  return (
    <div className="space-y-4">
      <UsersDataTableToolbar table={table} onSuspend={handleBulkSuspend} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {userColumns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={userColumns.length} className="h-24 text-center text-red-500">
                  Failed to load users. Please try again.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={userColumns.length} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />

      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isSuspending ? 'Suspend Users?' : 'Unsuspend Users?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {isSuspending ? 'suspend' : 'unsuspend'} {selectedIdsToSuspend.length} selected user(s)?
              {isSuspending && ' Suspended users will not be able to log in.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSuspend}
              className={isSuspending ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {isSuspending ? 'Suspend' : 'Unsuspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
