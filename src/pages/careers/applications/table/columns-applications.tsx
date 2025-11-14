import { type ColumnDef, type Row } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Download,
  Trash2,
  Star,
  User,
  Mail,
  Phone,
  Calendar,
  Building,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  useDeleteApplication,
  useUpdateApplicationStatus,
} from "@/api/queries/application.query";
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { type Application, ApplicationStatus } from "@/types/application";




const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const getStatusBadge = (status: ApplicationStatus) => {
  const statusConfig = {
    [ApplicationStatus.PENDING]: {
      color: "bg-yellow-100 text-yellow-800",
      label: "Pending",
    },
    [ApplicationStatus.REVIEWING]: {
      color: "bg-blue-100 text-blue-800",
      label: "Reviewing",
    },
    [ApplicationStatus.SHORTLISTED]: {
      color: "bg-purple-100 text-purple-800",
      label: "Shortlisted",
    },
    [ApplicationStatus.INTERVIEWED]: {
      color: "bg-indigo-100 text-indigo-800",
      label: "Interviewed",
    },
    [ApplicationStatus.OFFERED]: {
      color: "bg-teal-100 text-teal-800",
      label: "Offered",
    },
    [ApplicationStatus.HIRED]: {
      color: "bg-green-100 text-green-800",
      label: "Hired",
    },
    [ApplicationStatus.REJECTED]: {
      color: "bg-red-100 text-red-800",
      label: "Rejected",
    },
    [ApplicationStatus.WITHDRAWN]: {
      color: "bg-gray-100 text-gray-800",
      label: "Withdrawn",
    },
  };

  const config = statusConfig[status] || {
    color: "bg-gray-100 text-gray-800",
    label: status,
  };

  return (
    <Badge className={`${config.color} hover:${config.color}`}>
      {config.label}
    </Badge>
  );
};

const ApplicationActionsCell = ({ row }: { row: Row<Application> }) => {
  const application = row.original;
  const deleteMutation = useDeleteApplication();
  const updateStatusMutation = useUpdateApplicationStatus();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleStatusUpdate = (status: ApplicationStatus) => {
    const promise = updateStatusMutation.mutateAsync({
      id: application.id,
      data: { status },
    });
    toast.promise(promise, {
      loading: "Updating application status...",
      success: "Application status updated successfully.",
      error: (err: any) =>
        err.response?.data?.error?.message || "Failed to update status",
    });
  };

  const handleDelete = () => {
    const promise = deleteMutation.mutateAsync(application.id);
    toast.promise(promise, {
      loading: "Deleting application...",
      success: "Application deleted successfully.",
      error: (err: any) =>
        err.response?.data?.error?.message || "Failed to delete application",
    });
    setShowDeleteDialog(false);
  };

  const statusOptions = [
    { value: ApplicationStatus.PENDING, label: "Pending" },
    { value: ApplicationStatus.REVIEWING, label: "Reviewing" },
    { value: ApplicationStatus.SHORTLISTED, label: "Shortlisted" },
    { value: ApplicationStatus.INTERVIEWED, label: "Interviewed" },
    { value: ApplicationStatus.OFFERED, label: "Offered" },
    { value: ApplicationStatus.HIRED, label: "Hired" },
    { value: ApplicationStatus.REJECTED, label: "Rejected" },
  ];

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
            onClick={() => window.open(application.resumeUrl, "_blank")}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Resume
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Star className="mr-2 h-4 w-4" />
              Change Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {statusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleStatusUpdate(option.value)}
                  disabled={application.status === option.value}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Application
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              application from {application.fullName}.
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

export const applicationColumns: ColumnDef<Application>[] = [
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
    accessorKey: "fullName",
    header: "Candidate",
    cell: ({ row }) => {
      const application = row.original;
      return (
        <div className="space-y-1 min-w-[200px]">
          <div className="flex items-center space-x-2">
            <User className="h-3 w-3 text-muted-foreground" />
            <p className="font-medium text-sm">{application.fullName}</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span>{application.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{application.phone}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "careerTitle",
    header: "Position",
    cell: ({ row }) => {
      const application = row.original;
      return (
        <div className="space-y-1 min-w-[180px]">
          <p className="font-medium text-sm">{application.careerTitle}</p>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Building className="h-3 w-3" />
            <span>{application.department}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number | undefined;
      if (!rating)
        return <span className="text-sm text-muted-foreground">-</span>;
      return (
        <div className="flex items-center space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "howDidYouHear",
    header: "Source",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal">
        {row.getValue("howDidYouHear")}
      </Badge>
    ),
  },
  {
    accessorKey: "appliedAt",
    header: "Applied Date",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>{formatDate(row.getValue("appliedAt"))}</span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <ApplicationActionsCell row={row} />,
  },
];
