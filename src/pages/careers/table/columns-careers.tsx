import { type ColumnDef, type Row } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  MapPin,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useDeleteCareer, useUpdateCareer } from "@/api/queries/career.query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { type Career, CareerStatus } from "@/types/career";




const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

const getStatusBadge = (status: CareerStatus) => {
  switch (status) {
    case CareerStatus.PUBLISHED:
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Published
        </Badge>
      );
    case CareerStatus.DRAFT:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Clock className="mr-1 h-3 w-3" />
          Draft
        </Badge>
      );
    case CareerStatus.CLOSED:
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
          <XCircle className="mr-1 h-3 w-3" />
          Closed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const CareerActionsCell = ({ row }: { row: Row<Career> }) => {
  const career = row.original;
  const deleteMutation = useDeleteCareer();
  const updateMutation = useUpdateCareer();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleStatusUpdate = (status: CareerStatus) => {
    const promise = updateMutation.mutateAsync({
      id: career.id,
      data: { status },
    });
    toast.promise(promise, {
      loading: "Updating career status...",
      success: `Career is now ${status}.`,
      error: (err: any) =>
        err.response?.data?.error?.message || "Failed to update status",
    });
  };

  const handleDelete = () => {
    const promise = deleteMutation.mutateAsync(career.id);
    toast.promise(promise, {
      loading: "Deleting career...",
      success: "Career deleted successfully.",
      error: (err: any) =>
        err.response?.data?.error?.message || "Failed to delete career",
    });
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              window.open(`/careers/form?id=${career.id}`, "_self")
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Career
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              window.open(
                `/careers/applications?careerId=${career.id}`,
                "_self"
              )
            }
          >
            <Users className="mr-2 h-4 w-4" />
            View Applications ({career.applicationsCount})
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {career.status === CareerStatus.PUBLISHED && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate(CareerStatus.CLOSED)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Close Position
            </DropdownMenuItem>
          )}
          {career.status === CareerStatus.DRAFT && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate(CareerStatus.PUBLISHED)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Publish Career
            </DropdownMenuItem>
          )}
          {career.status === CareerStatus.CLOSED && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate(CareerStatus.PUBLISHED)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Reopen Position
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setShowDeleteDialog(true)}
            disabled={career.applicationsCount > 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Career
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              career posting {career.title}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const careerColumns: ColumnDef<Career>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Position",
    cell: ({ row }) => {
      const career = row.original;
      return (
        <div className="space-y-1 min-w-[250px]">
          <p className="font-medium text-sm">{career.title}</p>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{career.location}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal">
        {row.getValue("department")}
      </Badge>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.getValue("type")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    accessorKey: "applicationsCount",
    header: "Applications",
    cell: ({ row }) => {
      const count = row.getValue("applicationsCount") as number;
      const newCount = row.original.newApplicationsCount;
      return (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{count}</span>
          {newCount > 0 && (
            <Badge variant="destructive" className="text-xs px-1.5 py-0">
              {newCount} new
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "postedDate",
    header: "Posted Date",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>{formatDate(row.getValue("postedDate"))}</span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CareerActionsCell row={row} />,
  },
];
