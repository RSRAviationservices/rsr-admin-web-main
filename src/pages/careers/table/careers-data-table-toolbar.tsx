import type { Table } from "@tanstack/react-table";
import { X, Search, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { DataTableFacetedFilter } from "@/components/common/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/common/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type Career,
  CareerStatus,
  CareerDepartment,
  EmploymentType,
} from "@/types/career";


const careerStatusOptions = [
  { value: CareerStatus.PUBLISHED, label: "Published" },
  { value: CareerStatus.DRAFT, label: "Draft" },
  { value: CareerStatus.CLOSED, label: "Closed" },
];

const departmentOptions = Object.values(CareerDepartment).map((dept) => ({
  value: dept,
  label: dept,
}));

const employmentTypeOptions = Object.values(EmploymentType).map((type) => ({
  value: type,
  label: type,
}));

interface CareersDataTableToolbarProps {
  table: Table<Career>;
  onDelete?: (ids: string[]) => void;
}

export function CareersDataTableToolbar({
  table,
  onDelete,
}: CareersDataTableToolbarProps) {
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    !!table.getState().globalFilter;
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search careers..."
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-8 w-[200px] lg:w-[300px] pl-8"
          />
        </div>
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={careerStatusOptions}
          />
        )}
        {table.getColumn("department") && (
          <DataTableFacetedFilter
            column={table.getColumn("department")}
            title="Department"
            options={departmentOptions}
          />
        )}
        {table.getColumn("type") && (
          <DataTableFacetedFilter
            column={table.getColumn("type")}
            title="Type"
            options={employmentTypeOptions}
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
        <Button
          variant="default"
          size="sm"
          className="h-8"
          onClick={() => navigate("/careers/form?mode=create")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Career
        </Button>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
