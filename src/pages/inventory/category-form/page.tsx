import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { CategoryFormValues } from "./category-form-schema";
import { CategoryForm } from "./CategoryForm";
import {
  useCreateCategory,
  useGetCategoryById,
  useUpdateCategory,
} from "@/api/queries/inventory.query";
import { FormBreadcrumb } from "@/components/common/FormBreadcrumb";
import PageHeader from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import PageLayout from "@/layouts/PageLayout";

export default function CategoryFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get("mode") === "edit" ? "edit" : "create";
  const categoryId = searchParams.get("id") || "";

  const {
    data: categoryResponse,
    isLoading: isLoadingCategory,
    isError,
  } = useGetCategoryById(categoryId);

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (values: CategoryFormValues) => {
    // Ensure empty string for image is converted to null/undefined if needed by backend
    const submitData = {
      ...values,
      image: values.image || null, // or undefined, depending on backend expectations
    };

    const promise =
      mode === "edit"
        ? updateMutation.mutateAsync({ id: categoryId, data: submitData })
        : createMutation.mutateAsync(submitData);

    toast.promise(promise, {
      loading: `Saving category...`,
      success: () => {
        navigate("/inventory");
        return `Category successfully ${mode === "edit" ? "updated" : "created"}.`;
      },
      error: (err) => `Error: ${err.message}`,
    });
  };

  const pageTitle = mode === "edit" ? "Edit Category" : "Create New Category";
  const pageDescription =
    mode === "edit"
      ? "Update the details of an existing product category."
      : "Fill out the form to add a new category to your inventory.";

  const initialDataForForm = categoryResponse?.data
    ? {
      ...categoryResponse.data,
      image: categoryResponse.data.image ?? "",
    }
    : undefined;

  const breadcrumbItems = [{ label: "Inventory", href: "/inventory" }];

  if (isLoadingCategory && mode === "edit") {
    return <FormSkeleton title={pageTitle} description={pageDescription} />;
  }

  if (isError && mode === "edit") {
    return (
      <div>
        <PageHeader title="Error" description="Could not load category data." />
        <PageLayout>
          <p className="text-red-500">
            There was a problem fetching the category details. Please try again.
          </p>
        </PageLayout>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={pageTitle} description={pageDescription} />
      <PageLayout>
        <div className="max-w-5xl mx-auto">
          <div className="mt-4">
            <FormBreadcrumb items={breadcrumbItems} currentPage={pageTitle} />
          </div>
          <CategoryForm
            mode={mode}
            initialData={initialDataForForm}
            categoryId={categoryId} // Pass categoryId for upload context
            onSubmit={handleSubmit}
            onCancel={() => navigate("/inventory")}
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
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
