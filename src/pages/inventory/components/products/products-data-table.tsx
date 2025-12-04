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


import { columns } from './columns-products'
import { ProductsDataTableToolbar } from './products-data-table-toolbar'

import { useGetProducts, useDeleteProduct } from '@/api/queries/inventory.query'
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
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'

export function ProductsDataTable() {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const pagination = React.useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize])

  const searchFilter = columnFilters.find((f) => f.id === 'name')
  const statusFilter = columnFilters.find((f) => f.id === 'isActive')

  const debouncedSearch = useDebounce(searchFilter?.value as string, 500)

  const queryParams = React.useMemo(() => {
    return {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearch,
      isActive: statusFilter?.value as boolean | undefined
    }
  }, [pagination, debouncedSearch, statusFilter])

  const { data: response, isLoading, isError } = useGetProducts(queryParams)
  const data = response?.data ?? []
  const pageCount = response?.meta?.totalPages ?? 0

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination
    },
    enableRowSelection: true,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel()
  })

  const deleteMutation = useDeleteProduct()
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [selectedIdsToDelete, setSelectedIdsToDelete] = React.useState<string[]>([])

  const handleBulkDelete = (ids: string[]) => {
    setSelectedIdsToDelete(ids)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      // Execute all deletes in parallel
      await Promise.all(selectedIdsToDelete.map((id) => deleteMutation.mutateAsync(id)))
      toast.success(`Successfully deleted ${selectedIdsToDelete.length} products`)
      setRowSelection({})
    } catch (error) {
      toast.error('Failed to delete some products')
    } finally {
      setShowDeleteDialog(false)
      setSelectedIdsToDelete([])
    }
  }

  return (
    <div className="space-y-4 w-full h-full">
      <ProductsDataTableToolbar table={table} onDelete={handleBulkDelete} />
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
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-red-500">
                  Failed to load products. Please try again.
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
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
              This action cannot be undone. This will permanently delete {selectedIdsToDelete.length} selected product(s).
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
