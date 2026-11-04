import type { Table } from '@tanstack/react-table'
import { FileSpreadsheet, Loader2, PlusCircle, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { DataTableFacetedFilter } from '@/components/common/data-table-faceted-filter'
import { DataTableViewOptions } from '@/components/common/data-table-view-options'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { exportProducts } from '@/api/services/inventory.api'
import type { AdminProductsQueryDto } from '@/types/inventory'
import { BulkUploadDialog } from './BulkUploadDialog'
import { downloadProductsExcel } from './export-products'

interface ProductsToolbarProps<TData> {
  table: Table<TData>
  onDelete?: (ids: string[]) => void
  exportParams?: Omit<AdminProductsQueryDto, 'page' | 'limit'>
}

export function ProductsDataTableToolbar<TData>({ table, onDelete, exportParams }: ProductsToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const navigate = useNavigate()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const { data } = await exportProducts(exportParams ?? {})
      if (data.length === 0) {
        toast.info('No products to export')
        return
      }
      await downloadProductsExcel(data)
      toast.success(`Exported ${data.length} products`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export products')
    } finally {
      setIsExporting(false)
    }
  }

  const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ]

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search by name or part number..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('isActive') && (
          <DataTableFacetedFilter
            column={table.getColumn('isActive')}
            title="Status"
            options={statusOptions}
          />
        )}
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
          variant="outline"
          className="h-8"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="mr-2 h-4 w-4" />
          )}
          Export Excel
        </Button>
        <BulkUploadDialog />
        <Button
          size="sm"
          className="h-8"
          onClick={() => navigate('/inventory/product-form?mode=create')}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
    </div>
  )
}
