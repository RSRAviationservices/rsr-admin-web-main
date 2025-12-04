import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as React from "react";
import type { ProductFormValues } from "./product-form-schema";
import { productFormSchema } from "./product-form-schema";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/common/ImageUpload";
import { AssetContext } from "@/types/asset";
import type { Category } from "@/types/inventory";

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: Partial<ProductFormValues>;
  productId?: string; // Add productId for upload context
  allCategories: Category[];
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const defaultValues: ProductFormValues = {
  name: "",
  partNumber: "",
  brand: "",
  description: "",
  categorySlug: "",
  subcategorySlug: "",
  images: [], // Add default empty array
  tags: [],
  applications: [],
  availability: {
    status: "in-stock",
    leadTime: "",
    minimumQuantity: 0,
    allowAlternatives: false,
  },
  storage: {
    temperatureControlled: false,
    hazmat: false,
    shelfLife: "",
    storageInstructions: "",
  },
  compliance: {
    certifications: [],
    hasCoC: false,
    hasSDS: false,
    hasTDS: false,
    militarySpec: "",
  },
  isActive: true,
};

// A helper to create labels with an optional marker
const OptionalLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center">
    <FormLabel>{children}</FormLabel>
    <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
  </div>
);

export function ProductForm({
  mode,
  initialData,
  productId,
  allCategories,
  onSubmit,
  onCancel,
  isSubmitting,
}: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  // Watch the selected category to dynamically populate subcategories
  const selectedCategorySlug = form.watch("categorySlug");
  const subcategories = useMemo(() => {
    const selectedCategory = allCategories.find(
      (cat) => cat.slug === selectedCategorySlug
    );
    return selectedCategory?.subcategorySlugs || [];
  }, [selectedCategorySlug, allCategories]);

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      const dataToReset = {
        ...defaultValues,
        ...initialData,
        images: initialData.images || [], // Ensure images is always an array
        availability: {
          ...defaultValues.availability,
          ...initialData.availability,
        },
        storage: { ...defaultValues.storage, ...initialData.storage },
        compliance: { ...defaultValues.compliance, ...initialData.compliance },
      };
      form.reset(dataToReset);
    } else {
      form.reset(defaultValues);
    }
  }, [initialData, mode, form]);

  // Reset subcategory when main category changes
  useEffect(() => {
    form.setValue("subcategorySlug", "");
  }, [selectedCategorySlug, form]);

  return (
    <div className="py-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-zinc-50 dark:bg-slate-900/50 p-8 rounded-lg space-y-12"
        >
          {/* Main Form Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-12">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Core Details Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Core Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Basic information to identify the product.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., GPS Antenna" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="partNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., BCD-12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Boeing" {...field} />
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
                          placeholder="Detailed product description..."
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

              {/* Product Images Section - NEW */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Product Images</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload 1-5 images to showcase the product.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <OptionalLabel>Images</OptionalLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || []}
                          onChange={(value) => {
                            // value is string[] (multiple images)
                            field.onChange(value);
                          }}
                          context={AssetContext.PRODUCTS}
                          contextId={productId}
                          multiple={true}
                          maxFiles={5}
                          maxSize={5}
                          gridSize={150}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Upload up to 5 product images (max 5MB each).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Advanced Options Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Additional Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Specify availability, storage requirements, and other
                    details.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="availability.status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in-stock">In Stock</SelectItem>
                            <SelectItem value="limited">Limited</SelectItem>
                            <SelectItem value="lead-time">Lead Time</SelectItem>
                            <SelectItem value="quote-only">
                              Quote Only
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="availability.minimumQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <OptionalLabel>Minimum Quantity</OptionalLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 10"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : e.target.valueAsNumber
                              )
                            }
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="storage.shelfLife"
                    render={({ field }) => (
                      <FormItem>
                        <OptionalLabel>Shelf Life</OptionalLabel>
                        <FormControl>
                          <Input placeholder="e.g., 24 Months" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-4 pt-2">
                  <FormField
                    control={form.control}
                    name="storage.temperatureControlled"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Temp. Controlled</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="storage.hazmat"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Hazmat</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <OptionalLabel>Tags</OptionalLabel>
                {tagFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`tags.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="grow">
                          <FormControl>
                            <Input placeholder="e.g., high-demand" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTag(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => appendTag({ value: "" })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Tag
                </Button>
              </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Control the product&lsquo;s visibility.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Product
                        </FormLabel>
                        <FormDescription>
                          Inactive products are hidden.
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

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Classification</h3>
                  <p className="text-sm text-muted-foreground">
                    Organize the product.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="categorySlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allCategories.map((cat) => (
                            <SelectItem key={cat.slug} value={cat.slug}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subcategorySlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={subcategories.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subcategory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subcategories.map((slug) => (
                            <SelectItem key={slug} value={slug}>
                              {slug}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {subcategories.length === 0 && (
                        <FormDescription>
                          Select a main category first.
                        </FormDescription>
                      )}
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
              {mode === "create" ? "Create Product" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
