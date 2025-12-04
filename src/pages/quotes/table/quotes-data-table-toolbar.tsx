import type { Table } from '@tanstack/react-table'
import { X, Search, Trash2 } from 'lucide-react'

import { DataTableFacetedFilter } from '@/components/common/data-table-faceted-filter'
import { DataTableViewOptions } from '@/components/common/data-table-view-options'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QuoteStatus } from '@/types/quote'
import type { QuoteRequest } from '@/types/quote';

// Define options for the status filter dropdown
export const quoteStatusOptions = [
  { value: QuoteStatus.PENDING, label: 'Pending' },
  { value: QuoteStatus.APPROVED, label: 'Approved' },
  { value: QuoteStatus.REJECTED, label: 'Rejected' },
  { value: QuoteStatus.FULFILLED, label: 'Fulfilled' }
]

interface QuotesDataTableToolbarProps {
  table: Table<QuoteRequest>
  onDelete?: (ids: string[]) => void
}

export function QuotesDataTableToolbar({ table, onDelete }: QuotesDataTableToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by quote #, name, email..."
            value={table.getState().globalFilter ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-8 w-[200px] lg:w-[300px] pl-8"
          />
        </div>

        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={quoteStatusOptions}
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
            <Button
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={() => {
                const selectedRows = table.getFilteredSelectedRowModel().rows
                const selectedIds = selectedRows.map((row) => row.original.id)
                onDelete?.(selectedIds)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}
        </div>

        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
