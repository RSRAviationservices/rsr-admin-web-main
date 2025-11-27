import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import * as React from 'react'


import { AdminsDataTableToolbar } from './admins-data-table-toolbar'
import { adminColumns } from './columns-admins'

import { useGetAdmins } from '@/api/queries/admin.query'
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
import { useUpdateAdminStatus } from '@/api/queries/admin.query'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'
import { AdminStatus } from '@/types/admin'

export function AdminsDataTable() {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'createdAt', desc: true }])
  const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8
  })

  const debouncedSearch = useDebounce(globalFilter, 500)
  const statusFilter = columnFilters.find((f) => f.id === 'status')?.value as
    | AdminStatus[]
    | undefined

  const queryParams = React.useMemo(() => {
    return {
      page: pageIndex + 1,
      limit: pageSize,
      search: debouncedSearch,
      status: statusFilter?.[0]
    }
  }, [pageIndex, pageSize, debouncedSearch, statusFilter])

  const { data: response, isLoading, isError } = useGetAdmins(queryParams)
  const data = response?.data ?? []
  const pageCount = response?.meta?.totalPages ?? 0

  const table = useReactTable({
    data,
    columns: adminColumns,
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

  const updateStatusMutation = useUpdateAdminStatus()
  const [showStatusDialog, setShowStatusDialog] = React.useState(false)
  const [selectedIdsToUpdate, setSelectedIdsToUpdate] = React.useState<string[]>([])
  const [targetStatus, setTargetStatus] = React.useState<AdminStatus>(AdminStatus.ACTIVE)

  const handleBulkStatusUpdate = (ids: string[], status: AdminStatus) => {
    setSelectedIdsToUpdate(ids)
    setTargetStatus(status)
    setShowStatusDialog(true)
  }

  const confirmStatusUpdate = async () => {
    try {
      await Promise.all(
        selectedIdsToUpdate.map((id) =>
          updateStatusMutation.mutateAsync({ id, status: targetStatus })
        )
      )
      toast.success(
        `Successfully marked ${selectedIdsToUpdate.length} admins as ${targetStatus}`
      )
      setRowSelection({})
    } catch (error) {
      toast.error(`Failed to update status for some admins`)
    } finally {
      setShowStatusDialog(false)
      setSelectedIdsToUpdate([])
    }
  }

  return (
    <div className="space-y-4">
      <AdminsDataTableToolbar table={table} onUpdateStatus={handleBulkStatusUpdate} />
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
                  {adminColumns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={adminColumns.length} className="h-24 text-center text-red-500">
                  Failed to load admins. Please try again.
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
                <TableCell colSpan={adminColumns.length} className="h-24 text-center">
                  No admins found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />

      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {targetStatus === AdminStatus.SUSPENDED ? 'Suspend Admins?' : 'Activate Admins?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {targetStatus === AdminStatus.SUSPENDED ? 'suspend' : 'activate'} {selectedIdsToUpdate.length} selected admin(s)?
              {targetStatus === AdminStatus.SUSPENDED && ' Suspended admins will not be able to log in.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusUpdate}
              className={targetStatus === AdminStatus.SUSPENDED ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {targetStatus === AdminStatus.SUSPENDED ? 'Suspend' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
