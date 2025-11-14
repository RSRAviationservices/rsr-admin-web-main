import { create } from "zustand";

import type { CreateInsightDto, InsightStatus } from "@/types/insight";

interface FormErrors {
  [key: string]: string;
}

interface InsightFormState {
  // Form data
  formData: Partial<CreateInsightDto>;
  errors: FormErrors;
  isSubmitting: boolean;
  mode: "create" | "edit";
  insightId: string | null;

  // Actions
  setFormData: (data: Partial<CreateInsightDto>) => void;
  setField: (field: keyof CreateInsightDto, value: any) => void;
  setContent: (content: any) => void;
  setTags: (tags: string[]) => void;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setMode: (mode: "create" | "edit", insightId?: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  hydrateForm: (data: any) => void;
}

const initialFormData: Partial<CreateInsightDto> = {
  title: "",
  slug: "",
  excerpt: "",
  content: [], // Empty array instead of empty object
  coverImage: "",
  categoryId: "",
  tags: [],
  status: "draft" as InsightStatus,
  readTime: 5,
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
};

export const useInsightFormStore = create<InsightFormState>((set, get) => ({
  formData: initialFormData,
  errors: {},
  isSubmitting: false,
  mode: "create",
  insightId: null,

  setFormData: (data) => set({ formData: { ...get().formData, ...data } }),

  setField: (field, value) => {
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    }));
    get().clearError(field);
  },

  setContent: (content) => {
    set((state) => ({
      formData: { ...state.formData, content },
    }));
    get().clearError("content");
  },

  setTags: (tags) => {
    set((state) => ({
      formData: { ...state.formData, tags },
    }));
  },

  setError: (field, message) => {
    set((state) => ({
      errors: { ...state.errors, [field]: message },
    }));
  },

  clearError: (field) => {
    set((state) => {
      const newErrors = { ...state.errors };
      delete newErrors[field];
      return { errors: newErrors };
    });
  },

  clearAllErrors: () => set({ errors: {} }),

  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

  setMode: (mode, insightId) => set({ mode, insightId: insightId || null }),

  validateForm: () => {
    const { formData } = get();
    const newErrors: FormErrors = {};

    // Required field validations
    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (!formData.excerpt?.trim()) {
      newErrors.excerpt = "Excerpt is required";
    } else if (formData.excerpt.trim().length < 20) {
      newErrors.excerpt = "Excerpt must be at least 20 characters";
    } else if (formData.excerpt.trim().length > 500) {
      newErrors.excerpt = "Excerpt must not exceed 500 characters";
    }

    // Check if content exists and is not empty
    const hasContent =
      formData.content &&
      ((Array.isArray(formData.content) && formData.content.length > 0) ||
        (typeof formData.content === "object" &&
          Object.keys(formData.content).length > 0));

    if (!hasContent) {
      newErrors.content = "Content is required";
    }

    if (!formData.coverImage?.trim()) {
      newErrors.coverImage = "Cover image URL is required";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (!formData.tags || formData.tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    if (!formData.readTime || formData.readTime < 1) {
      newErrors.readTime = "Read time must be at least 1 minute";
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },

  resetForm: () =>
    set({
      formData: initialFormData,
      errors: {},
      isSubmitting: false,
      mode: "create",
      insightId: null,
    }),

  hydrateForm: (data) => {
    set({
      formData: {
        title: data.title || "",
        slug: data.slug || "",
        excerpt: data.excerpt || "",
        content: data.content || [],
        coverImage: data.coverImage || "",
        categoryId: data.categoryId || "",
        tags: data.tags || [],
        status: data.status || "draft",
        publishedAt: data.publishedAt,
        readTime: data.readTime || 5,
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
        ogImage: data.ogImage || "",
      },
      errors: {},
    });
  },
}));
