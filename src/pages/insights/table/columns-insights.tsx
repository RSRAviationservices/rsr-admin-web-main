import { type ColumnDef, type Row } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Calendar,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  useDeleteInsight,
  useUpdateInsight,
} from "@/api/queries/insight.query";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { type Insight, InsightStatus } from "@/types/insight";




const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

const getStatusBadge = (status: InsightStatus) => {
  switch (status) {
    case InsightStatus.PUBLISHED:
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Published
        </Badge>
      );
    case InsightStatus.DRAFT:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Clock className="mr-1 h-3 w-3" />
          Draft
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const InsightActionsCell = ({ row }: { row: Row<Insight> }) => {
  const insight = row.original;
  const deleteMutation = useDeleteInsight();
  const updateMutation = useUpdateInsight();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleStatusUpdate = (status: InsightStatus) => {
    const updateData: any = { status };
    if (status === InsightStatus.PUBLISHED && !insight.publishedAt) {
      updateData.publishedAt = new Date().toISOString();
    }

    const promise = updateMutation.mutateAsync({
      id: insight.id,
      data: updateData,
    });
    toast.promise(promise, {
      loading: "Updating insight status...",
      success: `Insight is now ${status}.`,
      error: (err: any) =>
        err.response?.data?.error?.message || "Failed to update status",
    });
  };

  const handleDelete = () => {
    const promise = deleteMutation.mutateAsync(insight.id);
    toast.promise(promise, {
      loading: "Deleting insight...",
      success: "Insight deleted successfully.",
      error: (err: any) =>
        err.response?.data?.error?.message || "Failed to delete insight",
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
              window.open(`/insights/form?id=${insight.id}`, "_self")
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Insight
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {insight.status === InsightStatus.PUBLISHED && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate(InsightStatus.DRAFT)}
            >
              <Clock className="mr-2 h-4 w-4" />
              Move to Draft
            </DropdownMenuItem>
          )}
          {insight.status === InsightStatus.DRAFT && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate(InsightStatus.PUBLISHED)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Publish Insight
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Insight
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              insight {insight.title}.
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

export const insightColumns: ColumnDef<Insight>[] = [
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
    header: "Post",
    cell: ({ row }) => {
      const insight = row.original;
      return (
        <div className="space-y-1 min-w-[300px]">
          <p className="font-medium text-sm line-clamp-2">{insight.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {insight.excerpt}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <Avatar className="h-5 w-5">
              <AvatarImage src={insight.author.avatar} />
              <AvatarFallback className="text-xs">
                {insight.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {insight.author.name}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "categoryName",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal">
        {row.getValue("categoryName")}
      </Badge>
    ),
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string[];
      if (!tags || tags.length === 0)
        return <span className="text-sm text-muted-foreground">-</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="mr-1 h-2 w-2" />
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
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
    accessorKey: "views",
    header: "Views",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Eye className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{row.getValue("views")}</span>
      </div>
    ),
  },
  {
    accessorKey: "readTime",
    header: "Read Time",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.getValue("readTime")} min
      </span>
    ),
  },
  {
    accessorKey: "publishedAt",
    header: "Published",
    cell: ({ row }) => {
      const date = row.getValue("publishedAt") as string | undefined;
      if (!date)
        return (
          <span className="text-sm text-muted-foreground">Not published</span>
        );
      return (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(date)}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <InsightActionsCell row={row} />,
  },
];
