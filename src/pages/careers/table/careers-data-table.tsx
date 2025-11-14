import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";


import { CareersDataTableToolbar } from "./careers-data-table-toolbar";
import { careerColumns } from "./columns-careers";

import { useCareers } from "@/api/queries/career.query";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import type { CareerStatus, CareerDepartment, EmploymentType } from "@/types/career";

export function CareersDataTable() {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "postedDate", desc: true },
  ]);
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  const debouncedSearch = useDebounce(globalFilter, 500);
  const statusFilter = columnFilters.find((f) => f.id === "status")?.value as
    | CareerStatus[]
    | undefined;
  const departmentFilter = columnFilters.find((f) => f.id === "department")
    ?.value as CareerDepartment[] | undefined;
  const typeFilter = columnFilters.find((f) => f.id === "type")?.value as
    | EmploymentType[]
    | undefined;

  const queryParams = React.useMemo(() => {
    return {
      page: pageIndex + 1,
      limit: pageSize,
      search: debouncedSearch,
      status: statusFilter?.[0],
      department: departmentFilter?.[0],
      type: typeFilter?.[0],
      sortBy: sorting[0]?.id as
        | "postedDate"
        | "title"
        | "applicationsCount"
        | undefined,
      sortOrder: sorting[0]?.desc ? ("desc" as const) : ("asc" as const),
    };
  }, [
    pageIndex,
    pageSize,
    debouncedSearch,
    statusFilter,
    departmentFilter,
    typeFilter,
    sorting,
  ]);

  const careersQuery = useCareers(queryParams);
  console.log(" 🚀", careersQuery);
  const response = careersQuery.data;
  const isLoading = careersQuery.isLoading;
  const isError = careersQuery.isError;

  const data = response?.data ?? [];
  const pageCount = response?.pagination?.totalPages ?? 0;

  const table = useReactTable({
    data,
    columns: careerColumns,
    pageCount,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination: { pageIndex, pageSize },
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
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <CareersDataTableToolbar table={table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {careerColumns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={careerColumns.length}
                  className="h-24 text-center text-red-500"
                >
                  Failed to load careers. Please try again.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={careerColumns.length}
                  className="h-24 text-center"
                >
                  No careers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
