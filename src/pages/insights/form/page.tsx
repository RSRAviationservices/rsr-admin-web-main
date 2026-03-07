import { ArrowLeft, Save, Trash2, Eye, Layout, Settings, Search, Clock, Info } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import PageLayout from "@/layouts/PageLayout";
import { InsightStatus, INSIGHT_CATEGORIES } from "@/types/insight";
import { AssetContext } from "@/types/asset";
import { cn } from "@/lib/utils";

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
    clearAllErrors();

    const isValid = validateForm();
    if (!isValid) {
      toast.error("Form Validation Failed", {
        description: "Please check the settings sidebar for errors."
      });
      return;
    }

    const cleanedData = {
      ...formData,
      tags: formData.tags?.filter((tag) => tag.trim()) || [],
    };

    const promise = mode === "create" 
      ? createMutation.mutateAsync(cleanedData as any)
      : updateMutation.mutateAsync({ id: insightId!, data: cleanedData as any });

    toast.promise(promise, {
      loading: mode === "create" ? "Publishing insight..." : "Saving changes...",
      success: () => {
        navigate("/insights");
        return mode === "create" ? "Insight published successfully!" : "Insight updated successfully!";
      },
      error: (err) => {
        return err.response?.data?.error?.message || err.message || "Failed to save insight";
      }
    });
  };

  const handleDelete = async () => {
    if (!insightId) return;

    const promise = deleteMutation.mutateAsync(insightId);

    toast.promise(promise, {
      loading: "Deleting insight...",
      success: () => {
        navigate("/insights");
        return "Insight deleted forever.";
      },
      error: (err) => err.response?.data?.error?.message || "Failed to delete insight"
    });
    
    setShowDeleteDialog(false);
  };

  if (mode === "edit" && isLoadingInsight) {
    return (
      <PageLayout>
        <div className="flex h-screen bg-stone-50">
          <div className="w-[30%] border-r bg-white p-6 space-y-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="flex-1 p-12 space-y-8">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-[500px] w-full" />
          </div>
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

  const isFormValid = !!(
    formData.title?.trim() &&
    formData.excerpt?.trim() &&
    formData.coverImage &&
    formData.categoryId &&
    formData.status
  );

  return (
    <PageLayout className="flex flex-col h-screen overflow-hidden bg-white">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Simplified and Clean Header */}
        <header className="w-full flex items-center justify-between px-6 py-3 bg-white border-b shrink-0 z-20">
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => navigate("/insights")}
              className="h-8 w-8 rounded-md"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">
                {mode === "create" ? "Create New Insight" : "Edit Insight"}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                {mode === "create" ? "Drafting new content" : `Status: ${formData.status}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {mode === "edit" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              size="sm"
              className="h-8 px-4"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-2" />
              )}
              {mode === "create" ? "Publish Insight" : "Save Changes"}
            </Button>
          </div>
        </header>

        {/* Interface Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Settings Sidebar (30%) - Minimal Style */}
          <aside className="w-[30%] min-w-[320px] max-w-[380px] border-r bg-stone-50/50 overflow-y-auto no-scrollbar shrink-0">
            <div className="p-6 space-y-8">
              <Tabs defaultValue="settings" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="settings" className="text-xs font-semibold">Settings</TabsTrigger>
                  <TabsTrigger value="seo" className="text-xs font-semibold">SEO</TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-6 mt-0">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest px-1">Classification</h3>
                      <div className="space-y-4 bg-white p-4 rounded-lg border border-stone-200 shadow-sm">
                        <FormField label="Category" required error={errors.categoryId}>
                          <SelectInput
                            value={formData.categoryId}
                            onChange={(value) => {
                              const category = INSIGHT_CATEGORIES.find((c) => c.id === value);
                              setField("categoryId", value);
                              if (category) setField("categoryName" as any, category.name);
                            }}
                            options={categoryOptions}
                            placeholder="Select category"
                          />
                        </FormField>

                        <FormField label="Status" required error={errors.status}>
                          <SelectInput
                            value={formData.status}
                            onChange={(value) => {
                              setField("status", value);
                              if (value === InsightStatus.PUBLISHED && !formData.publishedAt) {
                                setField("publishedAt", new Date().toISOString());
                              }
                            }}
                            options={statusOptions}
                            placeholder="Select status"
                          />
                        </FormField>

                        <FormField label="Read Time (min)" required error={errors.readTime}>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                            <Input
                              type="number"
                              min="1"
                              className="pl-9 h-9"
                              value={formData.readTime || ""}
                              onChange={(e) => setField("readTime", parseInt(e.target.value) || 1)}
                            />
                          </div>
                        </FormField>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest px-1">Featured Media</h3>
                      <div className="space-y-4 bg-white p-4 rounded-lg border border-stone-200 shadow-sm">
                        <FormField
                          label="Cover Image"
                          required
                          error={errors.coverImage}
                        >
                          <ImageUpload
                            value={formData.coverImage || ""}
                            onChange={(value) => setField("coverImage", value)}
                            context={AssetContext.BLOGS}
                            contextId={insightId || undefined}
                            multiple={false}
                            maxSize={5}
                            gridSize={240}
                            disabled={isSubmitting}
                            layout="cover"
                            className="rounded-md border-stone-200"
                          />
                        </FormField>

                        <FormField label="Tags" required error={errors.tags}>
                          <TagsInput
                            tags={formData.tags || []}
                            onChange={setTags}
                            error={errors.tags}
                          />
                        </FormField>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-6 mt-0">
                  <div className="bg-white p-5 rounded-lg border border-stone-200 space-y-5 shadow-sm">
                    <FormField label="URL Slug" error={errors.slug}>
                      <TextInput
                        value={formData.slug || ""}
                        onChange={(value) => setField("slug", value)}
                        placeholder="url-identifier"
                        className="font-mono text-xs h-9"
                      />
                    </FormField>

                    <FormField label="Meta Title">
                      <TextInput
                        value={formData.metaTitle || ""}
                        onChange={(value) => setField("metaTitle", value)}
                        placeholder="Search engine title"
                        className="h-9"
                      />
                    </FormField>

                    <FormField label="Meta Description">
                      <TextAreaInput
                        value={formData.metaDescription || ""}
                        onChange={(value) => setField("metaDescription", value)}
                        placeholder="Search engine summary"
                        rows={4}
                      />
                    </FormField>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </aside>

          {/* Main Content Area (70%) */}
          <div className="flex-1 bg-white overflow-y-auto custom-scrollbar relative">
            <div className="max-w-3xl mx-auto py-16 px-10 space-y-10">
              {/* Title Section */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <textarea
                    className="w-full bg-transparent border-none focus:ring-0 text-4xl font-bold text-gray-900 placeholder:text-stone-200 resize-none leading-tight overflow-hidden p-0"
                    placeholder="Insight Title..."
                    value={formData.title || ""}
                    onChange={(e) => {
                      setField("title", e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    rows={1}
                    autoFocus
                  />
                  {errors.title && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <textarea
                    className="w-full bg-transparent border-none focus:ring-0 text-lg text-stone-500 placeholder:text-stone-200 resize-none leading-relaxed overflow-hidden p-0"
                    placeholder="Write a short summary..."
                    value={formData.excerpt || ""}
                    onChange={(e) => {
                      setField("excerpt", e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    rows={1}
                  />
                  {errors.excerpt && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.excerpt}</p>}
                </div>
              </div>

              <Separator className="bg-stone-100" />

              {/* Editor Section */}
              <div className="pb-32">
                <BlockNoteEditorComponent
                  content={formData.content || {}}
                  onChange={setContent}
                  error={errors.content}
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Insight?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this insight? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);
