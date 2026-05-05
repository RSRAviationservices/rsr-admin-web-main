import { type ColumnDef, type Row } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Shield,
  Ban,
  CheckCircle,
  Crown,
  Settings,
  Trash2,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useUpdateAdminStatus, useDeleteAdmin } from "@/api/queries/admin.query";
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
import { type Admin, AdminRole, AdminStatus } from "@/types/admin";
import { useAuthStore } from "@/store/authStore";


const formatDate = (date: string | Date | undefined) => {
  if (!date) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const getRoleBadge = (role: AdminRole) => {
  switch (role) {
    case AdminRole.SUPER_ADMIN:
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
          <Crown className="mr-1 h-3 w-3" />
          Super Admin
        </Badge>
      );
    case AdminRole.ADMIN:
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          <Shield className="mr-1 h-3 w-3" />
          Admin
        </Badge>
      );
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
};

const getStatusBadge = (status: AdminStatus) => {
  switch (status) {
    case AdminStatus.ACTIVE:
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
    case AdminStatus.SUSPENDED:
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <Ban className="mr-1 h-3 w-3" />
          Suspended
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const AdminActionsCell = ({ row }: { row: Row<Admin> }) => {
  const admin = row?.original;
  const navigate = useNavigate();
  const currentAdmin = useAuthStore((state) => state.admin);
  const updateStatusMutation = useUpdateAdminStatus();
  const deleteMutation = useDeleteAdmin();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // RBAC: Only Super Admin can manage other admins
  if (!currentAdmin || !admin || currentAdmin.role !== AdminRole.SUPER_ADMIN) {
    return null;
  }

  // Prevent actions on self
  const isSelf = currentAdmin.id === admin.id;
  // Extra protection for other Super Admins
  const isTargetSuperAdmin = admin.role === AdminRole.SUPER_ADMIN;

  const handleStatusUpdate = (status: AdminStatus) => {
    if (isSelf) {
      toast.warning("You cannot change your own status.");
      return;
    }
    if (isTargetSuperAdmin) {
      toast.warning("Super Admin status cannot be modified.");
      return;
    }

    const promise = updateStatusMutation.mutateAsync({ id: admin.id, status });
    toast.promise(promise, {
      loading: "Updating admin status...",
      success: `Admin has been ${status === AdminStatus.ACTIVE ? 'activated' : 'suspended'}.`,
      error: (err) => `Error: ${err.message}`,
    });
  };

  const handleDelete = async () => {
    const promise = deleteMutation.mutateAsync(admin.id);
    toast.promise(promise, {
      loading: "Deleting admin account...",
      success: "Admin account deleted successfully.",
      error: (err) => `Error: ${err.message}`,
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
            onClick={() => navigate(`/admins/form?mode=edit&id=${admin.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Admin
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          {admin.status === AdminStatus.ACTIVE ? (
            <DropdownMenuItem
              className="text-amber-600"
              disabled={isSelf || isTargetSuperAdmin}
              onClick={() => handleStatusUpdate(AdminStatus.SUSPENDED)}
            >
              <Ban className="mr-2 h-4 w-4" />
              Suspend Admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-green-600"
              disabled={isSelf || isTargetSuperAdmin}
              onClick={() => handleStatusUpdate(AdminStatus.ACTIVE)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Activate Admin
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
            disabled={isSelf || isTargetSuperAdmin}
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Admin
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{admin.username}</strong>? This action cannot be undone and they will immediately lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const adminColumns: ColumnDef<Admin>[] = [
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
    accessorKey: "username",
    header: "Admin",
    cell: ({ row }) => {
      const admin = row.original;
      return (
        <div className="space-y-1">
          <p className="font-medium text-sm">{admin.fullName}</p>
          <div className="flex items-center space-x-2">
            {getRoleBadge(admin.role)}
            <span className="text-xs text-muted-foreground">@{admin.username}</span>
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
    accessorKey: "permissionCount",
    header: "Permissions",
    cell: ({ row }) => {
      const { role, permissionCount } = row.original;
      if (role === AdminRole.SUPER_ADMIN) {
        return <span className="text-sm font-medium text-purple-700">All</span>;
      }
      return (
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{permissionCount} resources</span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdByUsername",
    header: "Created By",
    cell: ({ row }) => {
      const createdBy = row.getValue("createdByUsername") as string | undefined;
      return (
        <span className="text-sm text-muted-foreground">
          {createdBy || "System"}
        </span>
      );
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.getValue("lastLogin"))}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.getValue("createdAt"))}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <AdminActionsCell row={row} />,
  },
];
