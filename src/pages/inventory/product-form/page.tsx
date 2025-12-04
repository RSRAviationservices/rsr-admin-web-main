import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { ProductFormValues } from "./product-form-schema";
import { ProductForm } from "./ProductForm";
import {
  useCreateProduct,
  useGetCategories,
  useGetProductById,
  useUpdateProduct,
} from "@/api/queries/inventory.query";
import { FormBreadcrumb } from "@/components/common/FormBreadcrumb";
import PageHeader from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import PageLayout from "@/layouts/PageLayout";
import type { Product } from "@/types/inventory";

export default function ProductFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get("mode") === "edit" ? "edit" : "create";
  const productId = searchParams.get("id") || "";

  const { data: productResponse, isLoading: isLoadingProduct } =
    useGetProductById(productId);
  const { data: categoriesResponse, isLoading: isLoadingCategories } =
    useGetCategories();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (values: ProductFormValues) => {
    const apiValues = {
      ...values,
      tags: values.tags?.map((t) => t.value),
      applications: values.applications?.map((a) => a.value),
    };

    const promise =
      mode === "edit"
        ? updateMutation.mutateAsync({
          id: productId,
          data: apiValues as Partial<Product>,
        })
        : createMutation.mutateAsync(apiValues as Partial<Product>);

    toast.promise(promise, {
      loading: "Saving product...",
      success: () => {
        navigate("/inventory");
        return `Product successfully ${mode === "edit" ? "updated" : "created"}.`;
      },
      error: (err) => `Error: ${err.message}`,
    });
  };

  const initialDataForForm = productResponse?.data
    ? {
      ...productResponse.data,
      images: productResponse.data.images || [],
      tags: productResponse.data.tags?.map((value) => ({ value })) || [],
      applications:
        productResponse.data.applications?.map((value) => ({ value })) || [],
    }
    : undefined;

  const isLoading =
    (isLoadingProduct && mode === "edit") || isLoadingCategories;
  const pageTitle = mode === "edit" ? "Edit Product" : "Create New Product";
  const pageDescription =
    mode === "edit"
      ? "Update the details of an existing product."
      : "Fill out the form to add a new product to your inventory.";

  const breadcrumbItems = [{ label: "Inventory", href: "/inventory" }];

  return (
    <div>
      <PageHeader title={pageTitle} description={pageDescription} />
      <PageLayout>
        <div className="max-w-6xl mx-auto">
          <div className="mt-4">
            <FormBreadcrumb items={breadcrumbItems} currentPage={pageTitle} />
          </div>
          {isLoading ? (
            <FormSkeleton />
          ) : (
            <ProductForm
              mode={mode}
              initialData={initialDataForForm}
              productId={productId}
              allCategories={categoriesResponse?.data || []}
              onSubmit={handleSubmit}
              onCancel={() => navigate("/inventory")}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </PageLayout>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
