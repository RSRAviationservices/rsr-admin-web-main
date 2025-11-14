import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useCreateAdmin,
  useUpdateAdmin,
  useGetAdminById,
} from "@/api/queries/admin.query";
import { FormBreadcrumb } from "@/components/common/FormBreadcrumb";
import PageHeader from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import PageLayout from "@/layouts/PageLayout";
import type { AdminFormData } from "@/types/admin";
import { AdminForm } from "./admin-form";
export default function AdminFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get("mode") === "edit" ? "edit" : "create";
  const adminId = searchParams.get("id") || "";

  const {
    data: adminData,
    isLoading: isLoadingAdmin,
    isError,
  } = useGetAdminById(adminId);

  const createMutation = useCreateAdmin();
  const updateMutation = useUpdateAdmin();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (values: AdminFormData) => {
    const promise =
      mode === "edit" && adminId
        ? updateMutation.mutateAsync({
            id: adminId,
            data: {
              password: values.password || undefined,
              role: values.role,
              status: values.status,
              permissions: values.permissions,
            },
          })
        : createMutation.mutateAsync({
            username: values.username,
            password: values.password!,
            role: values.role,
            status: values.status,
            permissions: values.permissions,
          });

    toast.promise(promise, {
      loading: `${mode === "create" ? "Creating" : "Updating"} admin...`,
      success: () => {
        navigate("/admins");
        return `Admin successfully ${mode === "edit" ? "updated" : "created"}.`;
      },
      error: (err) => `Error: ${err.response?.data?.message || err.message}`,
    });
  };

  const pageTitle = mode === "edit" ? "Edit Admin" : "Create New Admin";
  const pageDescription =
    mode === "edit"
      ? "Update the details of an existing admin account."
      : "Fill out the form to add a new admin to your system.";

  const breadcrumbItems = [{ label: "Admins", href: "/admins" }];

  if (isLoadingAdmin && mode === "edit") {
    return <FormSkeleton title={pageTitle} description={pageDescription} />;
  }

  if (isError && mode === "edit") {
    return (
      <div>
        <PageHeader title="Error" description="Could not load admin data." />
        <PageLayout>
          <p className="text-red-500">
            There was a problem fetching the admin details. Please try again.
          </p>
        </PageLayout>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={pageTitle} description={pageDescription} />
      <PageLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mt-4">
            <FormBreadcrumb items={breadcrumbItems} currentPage={pageTitle} />
          </div>
          <AdminForm
            mode={mode}
            initialData={adminData}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/admins")}
            isSubmitting={isSubmitting}
          />
        </div>
      </PageLayout>
    </div>
  );
}

function FormSkeleton({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <PageLayout>
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
          <div className="flex justify-end space-x-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
