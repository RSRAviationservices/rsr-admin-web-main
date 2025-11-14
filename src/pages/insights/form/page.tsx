import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import * as React from "react";
import { BlockNoteEditorComponent } from "./components/BlockNoteEditor";
import {
  FormField,
  TextInput,
  TextAreaInput,
  SelectInput,
} from "./components/FormField";
import { TagsInput } from "./components/TagsInput";
import { useInsightFormStore } from "./hooks/useInsightFormStore";

import {
  useCreateInsight,
  useUpdateInsight,
  useInsight,
  useDeleteInsight,
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/common/ImageUpload";
import PageLayout from "@/layouts/PageLayout";
import { InsightStatus, INSIGHT_CATEGORIES } from "@/types/insight";
import { AssetContext } from "@/types/asset";

export default function InsightFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = (searchParams.get("mode") || "create") as "create" | "edit";
  const insightId = searchParams.get("id");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    formData,
    errors,
    isSubmitting,
    setField,
    setContent,
    setTags,
    validateForm,
    resetForm,
    hydrateForm,
    setMode,
    setIsSubmitting,
    clearAllErrors,
  } = useInsightFormStore();

  const { data: insightData, isLoading: isLoadingInsight } = useInsight(
    insightId || "",
    {
      enabled: mode === "edit" && !!insightId,
    }
  );

  const createMutation = useCreateInsight();
  const updateMutation = useUpdateInsight();
  const deleteMutation = useDeleteInsight();

  useEffect(() => {
    setMode(mode, insightId || undefined);
    if (mode === "create") {
      resetForm();
    }
  }, [mode, insightId, setMode, resetForm]);

  useEffect(() => {
    if (mode === "edit" && insightData?.data) {
      hydrateForm(insightData.data);
    }
  }, [hydrateForm, insightData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🔍 Form submission triggered");
    console.log("📋 Form Data:", formData);

    clearAllErrors();

    const isValid = validateForm();
    console.log("✅ Validation result:", isValid);
    console.log("❌ Errors:", useInsightFormStore.getState().errors);

    if (!isValid) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanedData = {
        ...formData,
        tags: formData.tags?.filter((tag) => tag.trim()) || [],
      };

      console.log("📤 Submitting cleaned data:", cleanedData);

      if (mode === "create") {
        const result = await createMutation.mutateAsync(cleanedData as any);
        console.log("✅ Create success:", result);
        toast.success("Insight created successfully");
        navigate("/insights");
      } else if (mode === "edit" && insightId) {
        const result = await updateMutation.mutateAsync({
          id: insightId,
          data: cleanedData as any,
        });
        console.log("✅ Update success:", result);
        toast.success("Insight updated successfully");
        navigate("/insights");
      }
    } catch (error: any) {
      console.error("❌ Submission error:", error);
      console.error("Error response:", error.response);
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to save insight";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!insightId) return;

    try {
      await deleteMutation.mutateAsync(insightId);
      toast.success("Insight deleted successfully");
      navigate("/insights");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to delete insight"
      );
    }
    setShowDeleteDialog(false);
  };

  if (mode === "edit" && isLoadingInsight) {
    return (
      <PageLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageLayout>
    );
  }

  const categoryOptions = INSIGHT_CATEGORIES.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const statusOptions = Object.values(InsightStatus).map((status) => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  }));

  const isFormValid =
    formData.title &&
    formData.excerpt &&
    formData.content &&
    ((Array.isArray(formData.content) && formData.content.length > 0) ||
      (typeof formData.content === "object" &&
        Object.keys(formData.content).length > 0)) &&
    formData.coverImage &&
    formData.categoryId &&
    formData.tags &&
    formData.tags.length > 0 &&
    formData.status;

  return (
    <PageLayout className="h-screen">
      <form onSubmit={handleSubmit} className="space-y-5 bg-stone-100">
        {/* Header */}
        <div className="w-full flex items-center justify-between px-5 py-4 bg-white border-b sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => navigate("/insights")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {mode === "create" ? "Create New Insight" : "Edit Insight"}
              </h1>
              <p className="text-sm text-gray-500">
                {mode === "create"
                  ? "Write and publish a new blog post"
                  : "Update blog post"}
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
              {isSubmitting ? "Saving..." : "Save Insight"}
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
                <FormField label="Title" required error={errors.title}>
                  <TextInput
                    value={formData.title || ""}
                    onChange={(value) => setField("title", value)}
                    placeholder="e.g., The Future of Aviation Maintenance"
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
                    placeholder="e.g., future-of-aviation-maintenance"
                  />
                </FormField>

                <FormField label="Excerpt" required error={errors.excerpt}>
                  <TextAreaInput
                    value={formData.excerpt || ""}
                    onChange={(value) => setField("excerpt", value)}
                    placeholder="Brief summary of the post (20-500 characters)"
                    rows={3}
                    maxLength={500}
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Category"
                    required
                    error={errors.categoryId}
                  >
                    <SelectInput
                      value={formData.categoryId}
                      onChange={(value) => {
                        const category = INSIGHT_CATEGORIES.find(
                          (c) => c.id === value
                        );
                        setField("categoryId", value);
                        if (category) {
                          setField("categoryName" as any, category.name);
                        }
                      }}
                      options={categoryOptions}
                      placeholder="Select category"
                    />
                  </FormField>

                  <FormField
                    label="Read Time (minutes)"
                    required
                    error={errors.readTime}
                  >
                    <Input
                      type="number"
                      min="1"
                      value={formData.readTime || ""}
                      onChange={(e) =>
                        setField("readTime", parseInt(e.target.value) || 1)
                      }
                      placeholder="5"
                    />
                  </FormField>
                </div>

                {/* Cover Image Upload - UPDATED */}
                <FormField
                  label="Cover Image"
                  required
                  error={errors.coverImage}
                  description="Upload a cover image for the blog post (max 5MB)"
                >
                  <ImageUpload
                    value={formData.coverImage || ""}
                    onChange={(value) => {
                      // value is a string (single image URL)
                      setField("coverImage", value);
                    }}
                    context={AssetContext.BLOGS}
                    contextId={insightId || undefined}
                    multiple={false}
                    maxSize={5}
                    gridSize={300} // Larger size for cover image
                    disabled={isSubmitting}
                    className="w-full" // Full width
                    layout="cover"
                  />
                </FormField>

                <FormField label="Tags" required error={errors.tags}>
                  <TagsInput
                    tags={formData.tags || []}
                    onChange={setTags}
                    error={errors.tags}
                  />
                </FormField>

                <FormField label="Status" required error={errors.status}>
                  <SelectInput
                    value={formData.status}
                    onChange={(value) => {
                      setField("status", value);
                      if (
                        value === InsightStatus.PUBLISHED &&
                        !formData.publishedAt
                      ) {
                        setField("publishedAt", new Date().toISOString());
                      }
                    }}
                    options={statusOptions}
                    placeholder="Select status"
                  />
                </FormField>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card className="shadow-none w-full">
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField label="Blog Content" required error={errors.content}>
                  <BlockNoteEditorComponent
                    content={formData.content || {}}
                    onChange={setContent}
                    error={errors.content}
                  />
                </FormField>
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
                    placeholder="Title for search engines"
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

                <FormField label="OG Image URL">
                  <TextInput
                    value={formData.ogImage || ""}
                    onChange={(value) => setField("ogImage", value)}
                    placeholder="https://example.com/og-image.jpg"
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
              insight.
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
