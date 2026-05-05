import { Shield } from "lucide-react";
import { useEffect, useRef } from "react";

import { useGetPermissions } from "@/api/queries/admin.query";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Permission } from "@/types/admin";

interface PermissionSelectorProps {
  selectedPermissions: Permission[];
  onPermissionChange: (permissions: Permission[]) => void;
  error?: string;
}

export function PermissionSelector({
  selectedPermissions,
  onPermissionChange,
  error,
}: PermissionSelectorProps) {
  const { data: availablePermissions, isLoading } = useGetPermissions();

  const getSelectedActions = (resource: string) => {
    const permission = selectedPermissions.find((p) => p.resource === resource);
    return permission?.actions || [];
  };

  const isActionSelected = (resource: string, action: string) => {
    const selectedActions = getSelectedActions(resource);
    return selectedActions.includes(action);
  };

  const toggleAction = (resource: string, action: string) => {
    const newPermissions = [...selectedPermissions];
    const existingIndex = newPermissions.findIndex(
      (p) => p.resource === resource
    );

    if (existingIndex >= 0) {
      const currentActions = [...newPermissions[existingIndex].actions];
      if (currentActions.includes(action)) {
        const updatedActions = currentActions.filter((a) => a !== action);
        if (updatedActions.length === 0) {
          newPermissions.splice(existingIndex, 1);
        } else {
          newPermissions[existingIndex] = {
            ...newPermissions[existingIndex],
            actions: updatedActions,
          };
        }
      } else {
        newPermissions[existingIndex] = {
          ...newPermissions[existingIndex],
          actions: [...currentActions, action],
        };
      }
    } else {
      newPermissions.push({ resource, actions: [action] });
    }

    onPermissionChange(newPermissions);
  };

  const toggleAllActions = (resource: string, allActions: string[]) => {
    const newPermissions = [...selectedPermissions];
    const existingIndex = newPermissions.findIndex(
      (p) => p.resource === resource
    );
    const selectedActions = getSelectedActions(resource);
    const allSelected = allActions.every((action) =>
      selectedActions.includes(action)
    );

    if (allSelected) {
      if (existingIndex >= 0) {
        newPermissions.splice(existingIndex, 1);
      }
    } else {
      if (existingIndex >= 0) {
        newPermissions[existingIndex] = {
          ...newPermissions[existingIndex],
          actions: allActions,
        };
      } else {
        newPermissions.push({ resource, actions: allActions });
      }
    }

    onPermissionChange(newPermissions);
  };

  const IndeterminateCheckbox = ({
    resource,
    actions,
  }: {
    resource: string;
    actions: string[];
  }) => {
    const checkboxRef = useRef<HTMLButtonElement>(null);
    const selectedActions = getSelectedActions(resource);
    const allSelected = actions.every((action) =>
      selectedActions.includes(action)
    );
    const someSelected = selectedActions.length > 0;

    useEffect(() => {
      if (checkboxRef.current) {
        const inputElement = checkboxRef.current.querySelector("input");
        if (inputElement) {
          inputElement.indeterminate = someSelected && !allSelected;
        }
      }
    }, [someSelected, allSelected]);

    return (
      <Checkbox
        ref={checkboxRef}
        checked={allSelected}
        onCheckedChange={() => toggleAllActions(resource, actions)}
      />
    );
  };

  if (isLoading) {
    return (
      <Card className="rounded-md">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Map of backend action keys to UI display labels
  const actionLabelMap: Record<string, string> = {
    read: "Read",
    create: "Write",
    update: "Update",
    delete: "Delete",
  };

  // The set of all possible actions we want to show as columns
  const standardActions = ["read", "create", "update", "delete"];

  return (
    <div>
      <Card className="rounded-md">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Resource Permissions</span>
            <Badge variant="secondary" className="text-xs">
              {selectedPermissions.length} resources selected
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Select the permissions for each resource. Check the resource name to
            select all actions.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Resource</TableHead>
                {standardActions.map((action) => (
                  <TableHead key={action} className="w-[120px] text-center">
                    {actionLabelMap[action] || action}
                  </TableHead>
                ))}
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availablePermissions?.map((permissionDef) => {
                const selectedActions = getSelectedActions(
                  permissionDef.resource
                );
                const someSelected = selectedActions.length > 0;

                return (
                  <TableRow
                    key={permissionDef.resource}
                    className={`${someSelected ? "bg-blue-50/50 border-l-4 border-l-blue-500" : ""} h-16`}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <IndeterminateCheckbox
                          resource={permissionDef.resource}
                          actions={permissionDef.actions}
                        />
                        <div>
                          <div className="font-medium capitalize">
                            {permissionDef.resource}
                          </div>
                          {someSelected && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {selectedActions.length}/
                              {permissionDef.actions.length} selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {standardActions.map((action) => (
                      <TableCell key={action} className="text-center">
                        <Checkbox
                          disabled={!permissionDef.actions.includes(action)}
                          checked={isActionSelected(
                            permissionDef.resource,
                            action
                          )}
                          onCheckedChange={() =>
                            toggleAction(permissionDef.resource, action)
                          }
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {permissionDef.description}
                      </p>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
