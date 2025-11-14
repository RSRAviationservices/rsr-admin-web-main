import { type ColumnDef, type Row } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Shield,
  Ban,
  CheckCircle,
  Crown,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { useUpdateAdminStatus } from "@/api/queries/admin.query";
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
import { type Admin, AdminRole, AdminStatus } from "@/types/admin";


const formatDate = (date: Date) => {
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
  const admin = row.original;
  const mutation = useUpdateAdminStatus();

  const handleStatusUpdate = (status: AdminStatus) => {
    const promise = mutation.mutateAsync({ id: admin.id, status });
    toast.promise(promise, {
      loading: "Updating admin status...",
      success: `Admin has been ${status}.`,
      error: (err) => `Error: ${err.message}`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>Edit Permissions</DropdownMenuItem>
        <DropdownMenuSeparator />
        {admin.status === AdminStatus.ACTIVE ? (
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => handleStatusUpdate(AdminStatus.SUSPENDED)}
          >
            <Ban className="mr-2 h-4 w-4" />
            Suspend Admin
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="text-green-600"
            onClick={() => handleStatusUpdate(AdminStatus.ACTIVE)}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Activate Admin
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
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
          <p className="font-medium text-sm">{admin.username}</p>
          <div className="flex items-center space-x-1">
            {getRoleBadge(admin.role)}
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
