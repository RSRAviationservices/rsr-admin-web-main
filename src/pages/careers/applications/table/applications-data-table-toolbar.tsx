import type { Table } from "@tanstack/react-table";
import { X, Search, Trash2 } from "lucide-react";

import { DataTableFacetedFilter } from "@/components/common/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/common/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type Application,
  ApplicationStatus,
  ApplicationSource,
} from "@/types/application";
import { CareerDepartment } from "@/types/career";

const applicationStatusOptions = [
  { value: ApplicationStatus.PENDING, label: "Pending" },
  { value: ApplicationStatus.REVIEWING, label: "Reviewing" },
  { value: ApplicationStatus.SHORTLISTED, label: "Shortlisted" },
  { value: ApplicationStatus.INTERVIEWED, label: "Interviewed" },
  { value: ApplicationStatus.OFFERED, label: "Offered" },
  { value: ApplicationStatus.HIRED, label: "Hired" },
  { value: ApplicationStatus.REJECTED, label: "Rejected" },
  { value: ApplicationStatus.WITHDRAWN, label: "Withdrawn" },
];

const departmentOptions = Object.values(CareerDepartment).map((dept) => ({
  value: dept,
  label: dept,
}));

const sourceOptions = Object.values(ApplicationSource).map((source) => ({
  value: source,
  label: source,
}));

interface ApplicationsDataTableToolbarProps {
  table: Table<Application>;
  onDelete?: (ids: string[]) => void;
}

export function ApplicationsDataTableToolbar({
  table,
  onDelete,
}: ApplicationsDataTableToolbarProps) {
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    !!table.getState().globalFilter;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-8 w-[200px] lg:w-[300px] pl-8"
          />
        </div>
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={applicationStatusOptions}
          />
        )}
        {table.getColumn("department") && (
          <DataTableFacetedFilter
            column={table.getColumn("department")}
            title="Department"
            options={departmentOptions}
          />
        )}
        {table.getColumn("howDidYouHear") && (
          <DataTableFacetedFilter
            column={table.getColumn("howDidYouHear")}
            title="Source"
            options={sourceOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter("");
            }}
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
              const selectedRows = table.getFilteredSelectedRowModel().rows;
              const selectedIds = selectedRows.map((row) => row.original.id);
              onDelete?.(selectedIds);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete ({table.getFilteredSelectedRowModel().rows.length})
          </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}

