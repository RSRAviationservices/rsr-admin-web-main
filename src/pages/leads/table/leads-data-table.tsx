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


import { leadColumns } from './columns-leads'
import { LeadsDataTableToolbar } from './leads-data-table-toolbar'

import { useGetLeads } from '@/api/queries/lead.query'
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
import { useDeleteLead } from '@/api/queries/lead.query'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'
import type { ContactStatus } from '@/types/lead'

export function LeadsDataTable() {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'createdAt', desc: true }])
  const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15
  })

  const debouncedSearch = useDebounce(globalFilter, 500)
  const statusFilter = columnFilters.find((f) => f.id === 'status')?.value as
    | ContactStatus[]
    | undefined

  const queryParams = React.useMemo(() => {
    return {
      page: pageIndex + 1,
      limit: pageSize,
      search: debouncedSearch,
      status: statusFilter?.[0]
    }
  }, [pageIndex, pageSize, debouncedSearch, statusFilter])

  const { data: response, isLoading, isError } = useGetLeads(queryParams)
  const data = response?.data ?? []
  const pageCount = response?.meta?.totalPages ?? 0

  const table = useReactTable({
    data,
    columns: leadColumns,
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

  const deleteMutation = useDeleteLead()
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [selectedIdsToDelete, setSelectedIdsToDelete] = React.useState<string[]>([])

  const handleBulkDelete = (ids: string[]) => {
    setSelectedIdsToDelete(ids)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      await Promise.all(selectedIdsToDelete.map((id) => deleteMutation.mutateAsync(id)))
      toast.success(`Successfully deleted ${selectedIdsToDelete.length} leads`)
      setRowSelection({})
    } catch (error) {
      toast.error('Failed to delete some leads')
    } finally {
      setShowDeleteDialog(false)
      setSelectedIdsToDelete([])
    }
  }

  return (
    <div className="space-y-4">
      <LeadsDataTableToolbar table={table} onDelete={handleBulkDelete} />
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
                  {leadColumns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={leadColumns.length} className="h-24 text-center text-red-500">
                  Failed to load leads. Please try again.
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
                <TableCell colSpan={leadColumns.length} className="h-24 text-center">
                  No leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedIdsToDelete.length} selected lead(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
