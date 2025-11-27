import type { Table } from '@tanstack/react-table'
import { PlusCircle, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { DataTableViewOptions } from '@/components/common/data-table-view-options'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CategoriesToolbarProps<TData> {
  table: Table<TData>
  onDelete?: (ids: string[]) => void
}

export function CategoriesDataTableToolbar<TData>({ table, onDelete }: CategoriesToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter categories by name..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => {
              const selectedRows = table.getFilteredSelectedRowModel().rows
              const selectedIds = selectedRows.map((row) => (row.original as any).id)
              onDelete?.(selectedIds)
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete ({table.getFilteredSelectedRowModel().rows.length})
          </Button>
        )}
        <DataTableViewOptions table={table} />
        <Button
          size="sm"
          className="h-8"
          onClick={() => navigate('/inventory/category-form?mode=create')}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
    </div>
  )
}
