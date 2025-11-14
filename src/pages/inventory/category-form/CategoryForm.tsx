import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as React from "react";
import type { CategoryFormValues } from "./category-form-schema";
import { categoryFormSchema } from "./category-form-schema";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/common/ImageUpload";
import { AssetContext } from "@/types/asset";

interface CategoryFormProps {
  mode: "create" | "edit";
  initialData?: CategoryFormValues;
  categoryId?: string; // Add this to pass category ID for upload context
  onSubmit: (values: CategoryFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

// A helper to create labels with an optional marker
const OptionalLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center">
    <FormLabel>{children}</FormLabel>
    <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
  </div>
);

export function CategoryForm({
  mode,
  initialData,
  categoryId,
  onSubmit,
  onCancel,
  isSubmitting,
}: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      image: "",
      seoTitle: "",
      seoDescription: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  return (
    <div className="py-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-lg space-y-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-8">
              {/* Category Details Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Category Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide the name and description for this category.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Avionics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A detailed description of what this category includes."
                          className="resize-none"
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* SEO Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">
                    Search Engine Optimization
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Improve this category&lsquo;s visibility on search engines.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="seoTitle"
                  render={({ field }) => (
                    <FormItem>
                      <OptionalLabel>SEO Title</OptionalLabel>
                      <FormControl>
                        <Input
                          placeholder="A concise, SEO-friendly title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <OptionalLabel>SEO Description</OptionalLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A short description for search engine results."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Control the category&apos;s visibility.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Status
                        </FormLabel>
                        <FormDescription>
                          Inactive categories will be hidden from the public
                          website.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Display Image Section - Updated with ImageUpload */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Display Image</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload an image to represent this category.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <OptionalLabel>Category Image</OptionalLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || ""}
                          onChange={(value) => {
                            // value is a string (single image URL)
                            field.onChange(value);
                          }}
                          context={AssetContext.CATEGORIES}
                          contextId={categoryId}
                          multiple={false}
                          maxSize={5}
                          gridSize={200}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Upload a single image for this category (max 5MB).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

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
              {mode === "create" ? "Create Category" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
