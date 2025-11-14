import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import * as React from "react"
import { ContentSectionField } from "./components/ContentSectionField";
import {
  FormField,
  TextInput,
  TextAreaInput,
  SelectInput,
} from "./components/FormField";
import { useCareerFormStore } from "./hooks/useCareerFormStore";

import {
  useCreateCareer,
  useUpdateCareer,
  useCareer,
  useDeleteCareer,
} from "@/api/queries/career.query";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import PageLayout from "@/layouts/PageLayout";
import { CareerDepartment, EmploymentType, CareerStatus } from "@/types/career";

export default function CareerFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = (searchParams.get("mode") || "create") as "create" | "edit";
  const careerId = searchParams.get("id");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    formData,
    errors,
    isSubmitting,
    setField,
    setContentSection,
    addContentItem,
    updateContentItem,
    removeContentItem,
    setSalaryRange,
    validateForm,
    resetForm,
    hydrateForm,
    setMode,
    setIsSubmitting,
    clearAllErrors,
  } = useCareerFormStore();

  const { data: careerData, isLoading: isLoadingCareer } = useCareer(
    careerId || "",
    {
      enabled: mode === "edit" && !!careerId,
    }
  );

  const createMutation = useCreateCareer();
  const updateMutation = useUpdateCareer();
  const deleteMutation = useDeleteCareer();

  useEffect(() => {
    setMode(mode, careerId || undefined);
    if (mode === "create") {
      resetForm();
    }
  }, [mode, careerId, setMode, resetForm]);

  useEffect(() => {
    if (mode === "edit" && careerData?.data) {
      hydrateForm(careerData.data);
    }
  }, [careerData, hydrateForm, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🔍 Form submission triggered");
    console.log("📋 Form Data:", formData);

    // Clear previous errors
    clearAllErrors();

    // Validate form
    const isValid = validateForm();
    console.log("✅ Validation result:", isValid);
    console.log("❌ Errors:", useCareerFormStore.getState().errors);

    if (!isValid) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      // Clean up the form data before submission
      const cleanedData = {
        ...formData,
        // Filter out empty items from content sections
        description: {
          ...formData.description,
          items:
            formData.description?.items?.filter((item) => item.trim()) || [],
        },
        responsibilities: {
          ...formData.responsibilities,
          items:
            formData.responsibilities?.items?.filter((item) => item.trim()) ||
            [],
        },
        requirements: {
          ...formData.requirements,
          items:
            formData.requirements?.items?.filter((item) => item.trim()) || [],
        },
        benefits: {
          ...formData.benefits,
          items: formData.benefits?.items?.filter((item) => item.trim()) || [],
        },
        qualifications: {
          ...formData.qualifications,
          items:
            formData.qualifications?.items?.filter((item) => item.trim()) || [],
        },
        // Remove salary range if not fully filled
        salaryRange:
          formData.salaryRange?.min || formData.salaryRange?.max
            ? formData.salaryRange
            : undefined,
      };

      console.log("📤 Submitting cleaned data:", cleanedData);

      if (mode === "create") {
        const result = await createMutation.mutateAsync(cleanedData as any);
        console.log("✅ Create success:", result);
        toast.success("Career created successfully");
        navigate("/careers");
      } else if (mode === "edit" && careerId) {
        const result = await updateMutation.mutateAsync({
          id: careerId,
          data: cleanedData as any,
        });
        console.log("✅ Update success:", result);
        toast.success("Career updated successfully");
        navigate("/careers");
      }
    } catch (error: any) {
      console.error("❌ Submission error:", error);
      console.error("Error response:", error.response);
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to save career";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!careerId) return;

    try {
      await deleteMutation.mutateAsync(careerId);
      toast.success("Career deleted successfully");
      navigate("/careers");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to delete career"
      );
    }
    setShowDeleteDialog(false);
  };

  if (mode === "edit" && isLoadingCareer) {
    return (
      <PageLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageLayout>
    );
  }

  const departmentOptions = Object.values(CareerDepartment).map((dept) => ({
    value: dept,
    label: dept,
  }));
  const typeOptions = Object.values(EmploymentType).map((type) => ({
    value: type,
    label: type,
  }));
  const statusOptions = Object.values(CareerStatus).map((status) => ({
    value: status,
    label: status,
  }));

  // Check if form is valid for save button
  const isFormValid =
    formData.title &&
    formData.department &&
    formData.location &&
    formData.type &&
    formData.intro &&
    formData.status &&
    formData.responsibilities?.items?.some((item) => item.trim()) &&
    formData.requirements?.items?.some((item) => item.trim());

  return (
    <PageLayout>
      <form onSubmit={handleSubmit} className="space-y-6 bg-stone-100">
        {/* Header - INSIDE FORM */}
        <div className="w-full flex items-center justify-between px-5 py-4 bg-white border-b sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => navigate("/careers")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {mode === "create" ? "Create New Career" : "Edit Career"}
              </h1>
              <p className="text-sm text-gray-500">
                {mode === "create"
                  ? "Add a new job posting"
                  : "Update existing job posting"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {mode === "edit" && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !isFormValid}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Career"}
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex flex-col items-center px-6">
          <div className="w-full max-w-3xl space-y-5">
            {/* Basic Information */}
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Job Title" required error={errors.title}>
                    <TextInput
                      value={formData.title || ""}
                      onChange={(value) => setField("title", value)}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </FormField>

                  <FormField
                    label="Slug"
                    error={errors.slug}
                    description="Leave empty to auto-generate from title"
                  >
                    <TextInput
                      value={formData.slug || ""}
                      onChange={(value) => setField("slug", value)}
                      placeholder="e.g., senior-software-engineer"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="Department"
                    required
                    error={errors.department}
                  >
                    <SelectInput
                      value={formData.department}
                      onChange={(value) => setField("department", value)}
                      options={departmentOptions}
                      placeholder="Select department"
                    />
                  </FormField>

                  <FormField
                    label="Employment Type"
                    required
                    error={errors.type}
                  >
                    <SelectInput
                      value={formData.type}
                      onChange={(value) => setField("type", value)}
                      options={typeOptions}
                      placeholder="Select type"
                    />
                  </FormField>

                  <FormField label="Location" required error={errors.location}>
                    <TextInput
                      value={formData.location || ""}
                      onChange={(value) => setField("location", value)}
                      placeholder="e.g., New York, NY"
                    />
                  </FormField>
                </div>

                <FormField
                  label="Job Introduction"
                  required
                  error={errors.intro}
                >
                  <TextAreaInput
                    value={formData.intro || ""}
                    onChange={(value) => setField("intro", value)}
                    placeholder="Brief summary of the position..."
                    rows={3}
                  />
                </FormField>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card className="w-full shadow-none">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ContentSectionField
                  title={formData.description?.title || "Job Description"}
                  content={formData.description?.content}
                  items={formData.description?.items || []}
                  onTitleChange={(value) =>
                    setContentSection("description", { title: value })
                  }
                  onContentChange={(value) =>
                    setContentSection("description", { content: value })
                  }
                  onItemAdd={() => addContentItem("description")}
                  onItemUpdate={(index, value) =>
                    updateContentItem("description", index, value)
                  }
                  onItemRemove={(index) =>
                    removeContentItem("description", index)
                  }
                  showContent
                  itemPlaceholder="Description point..."
                />

                <ContentSectionField
                  title={
                    formData.responsibilities?.title || "Key Responsibilities"
                  }
                  items={formData.responsibilities?.items || []}
                  onTitleChange={(value) =>
                    setContentSection("responsibilities", { title: value })
                  }
                  onItemAdd={() => addContentItem("responsibilities")}
                  onItemUpdate={(index, value) =>
                    updateContentItem("responsibilities", index, value)
                  }
                  onItemRemove={(index) =>
                    removeContentItem("responsibilities", index)
                  }
                  error={errors.responsibilities}
                  itemPlaceholder="Responsibility..."
                />

                <ContentSectionField
                  title={formData.requirements?.title || "Requirements"}
                  items={formData.requirements?.items || []}
                  onTitleChange={(value) =>
                    setContentSection("requirements", { title: value })
                  }
                  onItemAdd={() => addContentItem("requirements")}
                  onItemUpdate={(index, value) =>
                    updateContentItem("requirements", index, value)
                  }
                  onItemRemove={(index) =>
                    removeContentItem("requirements", index)
                  }
                  error={errors.requirements}
                  itemPlaceholder="Requirement..."
                />

                <ContentSectionField
                  title={formData.benefits?.title || "Benefits"}
                  items={formData.benefits?.items || []}
                  onTitleChange={(value) =>
                    setContentSection("benefits", { title: value })
                  }
                  onItemAdd={() => addContentItem("benefits")}
                  onItemUpdate={(index, value) =>
                    updateContentItem("benefits", index, value)
                  }
                  onItemRemove={(index) => removeContentItem("benefits", index)}
                  itemPlaceholder="Benefit..."
                />

                <ContentSectionField
                  title={formData.qualifications?.title || "Qualifications"}
                  items={formData.qualifications?.items || []}
                  onTitleChange={(value) =>
                    setContentSection("qualifications", { title: value })
                  }
                  onItemAdd={() => addContentItem("qualifications")}
                  onItemUpdate={(index, value) =>
                    updateContentItem("qualifications", index, value)
                  }
                  onItemRemove={(index) =>
                    removeContentItem("qualifications", index)
                  }
                  itemPlaceholder="Qualification..."
                />
              </CardContent>
            </Card>

            {/* Salary & Dates */}
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Salary & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700">
                    Salary Range (Optional)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      label="Minimum"
                      error={errors["salaryRange.min"]}
                    >
                      <TextInput
                        value={formData.salaryRange?.min?.toString() || ""}
                        onChange={(value) =>
                          setSalaryRange({ min: Number(value) || undefined })
                        }
                        placeholder="50000"
                      />
                    </FormField>

                    <FormField
                      label="Maximum"
                      error={errors["salaryRange.max"]}
                    >
                      <TextInput
                        value={formData.salaryRange?.max?.toString() || ""}
                        onChange={(value) =>
                          setSalaryRange({ max: Number(value) || undefined })
                        }
                        placeholder="80000"
                      />
                    </FormField>

                    <FormField
                      label="Currency"
                      error={errors["salaryRange.currency"]}
                    >
                      <SelectInput
                        value={formData.salaryRange?.currency}
                        onChange={(value) =>
                          setSalaryRange({ currency: value })
                        }
                        options={[
                          { value: "USD", label: "USD" },
                          { value: "EUR", label: "EUR" },
                          { value: "GBP", label: "GBP" },
                          { value: "INR", label: "INR" },
                        ]}
                        placeholder="Select"
                      />
                    </FormField>

                    <FormField
                      label="Period"
                      error={errors["salaryRange.period"]}
                    >
                      <SelectInput
                        value={formData.salaryRange?.period}
                        onChange={(value) =>
                          setSalaryRange({ period: value as any })
                        }
                        options={[
                          { value: "annual", label: "Annual" },
                          { value: "monthly", label: "Monthly" },
                          { value: "hourly", label: "Hourly" },
                        ]}
                        placeholder="Select"
                      />
                    </FormField>
                  </div>
                  {errors.salaryRange && (
                    <p className="text-xs text-red-500">{errors.salaryRange}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="Status" required error={errors.status}>
                    <SelectInput
                      value={formData.status}
                      onChange={(value) => setField("status", value)}
                      options={statusOptions}
                      placeholder="Select status"
                    />
                  </FormField>

                  <FormField label="Posted Date">
                    <Input
                      type="date"
                      value={
                        formData.postedDate?.toString().split("T")[0] || ""
                      }
                      onChange={(e) => setField("postedDate", e.target.value)}
                    />
                  </FormField>

                  <FormField label="Expiry Date" error={errors.expiryDate}>
                    <Input
                      type="date"
                      value={
                        formData.expiryDate?.toString().split("T")[0] || ""
                      }
                      onChange={(e) => setField("expiryDate", e.target.value)}
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card className="w-full shadow-none">
              <CardHeader>
                <CardTitle>SEO (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField label="Meta Title">
                  <TextInput
                    value={formData.metaTitle || ""}
                    onChange={(value) => setField("metaTitle", value)}
                    placeholder="Career title for search engines"
                  />
                </FormField>

                <FormField label="Meta Description">
                  <TextAreaInput
                    value={formData.metaDescription || ""}
                    onChange={(value) => setField("metaDescription", value)}
                    placeholder="Brief description for search engines"
                    rows={2}
                  />
                </FormField>
              </CardContent>
            </Card>
          </div>
          <div className="h-32" />
        </div>
      </form>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              career posting.
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
    </PageLayout>
  );
}
