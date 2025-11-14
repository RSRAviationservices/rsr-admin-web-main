import type { Table } from "@tanstack/react-table";
import { X, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { DataTableFacetedFilter } from "@/components/common/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/common/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type Insight,
  InsightStatus,
  INSIGHT_CATEGORIES,
} from "@/types/insight";


const insightStatusOptions = [
  { value: InsightStatus.PUBLISHED, label: "Published" },
  { value: InsightStatus.DRAFT, label: "Draft" },
];

// Use predefined categories
const categoryOptions = INSIGHT_CATEGORIES.map((cat) => ({
  value: cat.name,
  label: cat.name,
}));

interface InsightsDataTableToolbarProps {
  table: Table<Insight>;
}

export function InsightsDataTableToolbar({
  table,
}: InsightsDataTableToolbarProps) {
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
            placeholder="Search insights..."
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-8 w-[200px] lg:w-[300px] pl-8"
          />
        </div>
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={insightStatusOptions}
          />
        )}
        {table.getColumn("categoryName") && (
          <DataTableFacetedFilter
            column={table.getColumn("categoryName")}
            title="Category"
            options={categoryOptions}
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
        <Button
          variant="default"
          size="sm"
          className="h-8"
          onClick={() => navigate("/insights/form?mode=create")}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Insight
        </Button>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
