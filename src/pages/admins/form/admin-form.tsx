import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Shield, AlertCircle, User, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AdminRole,
  AdminStatus,
  type Admin,
  type AdminFormData,
} from "@/types/admin";
import { PermissionSelector } from "./permission-selector";
import { getAdminFormSchema } from "./admin-form-schema";

interface AdminFormProps {
  mode: "create" | "edit";
  initialData?: Admin;
  onSubmit: (values: AdminFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function AdminForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: AdminFormProps) {
  const form = useForm<AdminFormData>({
    resolver: zodResolver(getAdminFormSchema(mode)),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      role: AdminRole.ADMIN,
      status: AdminStatus.ACTIVE,
      permissions: [],
    },
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.reset({
        username: initialData.username,
        password: "",
        confirmPassword: "",
        role: initialData.role,
        status: initialData.status,
        permissions: initialData.permissions || [],
      });
    } else {
      form.reset({
        username: "",
        password: "",
        confirmPassword: "",
        role: AdminRole.ADMIN,
        status: AdminStatus.ACTIVE,
        permissions: [],
      });
    }
  }, [mode, initialData, form]);

  const isPasswordRequired = mode === "create";

  return (
    <div className="py-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-lg space-y-8"
        >
          {/* Account Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Account Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="admin.username"
                        {...field}
                        disabled={mode === "edit"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={AdminRole.ADMIN}>
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <span>Admin</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={AdminStatus.ACTIVE}>
                          Active
                        </SelectItem>
                        <SelectItem value={AdminStatus.SUSPENDED}>
                          Suspended
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Security Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Security Settings</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password{" "}
                      {isPasswordRequired
                        ? "*"
                        : "(Leave blank to keep current)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={
                          isPasswordRequired
                            ? "Enter secure password"
                            : "Enter new password"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Confirm Password {isPasswordRequired ? "*" : ""}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {mode === "edit" && (
              <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Password Update</p>
                  <p>
                    Leave password fields empty to keep the current password
                    unchanged.
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Permissions */}
          <FormField
            control={form.control}
            name="permissions"
            render={({ field }) => (
              <FormItem>
                <PermissionSelector
                  selectedPermissions={field.value}
                  onPermissionChange={field.onChange}
                  error={form.formState.errors.permissions?.message}
                />
              </FormItem>
            )}
          />

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === "create" ? "Create Admin" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
