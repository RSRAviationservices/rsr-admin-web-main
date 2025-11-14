import { create } from "zustand";

import {
  type CreateCareerDto,
  type ContentSection,
  type SalaryRange,
  CareerStatus,
} from "@/types/career";

interface FormErrors {
  [key: string]: string;
}

interface CareerFormState {
  // Form data
  formData: Partial<CreateCareerDto>;
  errors: FormErrors;
  isSubmitting: boolean;
  mode: "create" | "edit";
  careerId: string | null;

  // Actions
  setFormData: (data: Partial<CreateCareerDto>) => void;
  setField: (field: keyof CreateCareerDto, value: any) => void;
  setContentSection: (
    field:
      | "description"
      | "responsibilities"
      | "requirements"
      | "benefits"
      | "qualifications",
    section: Partial<ContentSection>
  ) => void;
  addContentItem: (
    field:
      | "description"
      | "responsibilities"
      | "requirements"
      | "benefits"
      | "qualifications"
  ) => void;
  updateContentItem: (
    field:
      | "description"
      | "responsibilities"
      | "requirements"
      | "benefits"
      | "qualifications",
    index: number,
    value: string
  ) => void;
  removeContentItem: (
    field:
      | "description"
      | "responsibilities"
      | "requirements"
      | "benefits"
      | "qualifications",
    index: number
  ) => void;
  setSalaryRange: (salary: Partial<SalaryRange>) => void;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setMode: (mode: "create" | "edit", careerId?: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  hydrateForm: (data: any) => void;
}

const initialFormData: Partial<CreateCareerDto> = {
  title: "",
  slug: "",
  department: undefined,
  location: "",
  type: undefined,
  intro: "",
  description: { title: "Job Description", content: "", items: [] },
  responsibilities: { title: "Key Responsibilities", content: "", items: [""] },
  requirements: { title: "Requirements", content: "", items: [""] },
  benefits: { title: "Benefits", content: "", items: [] },
  qualifications: { title: "Qualifications", content: "", items: [] },
  salaryRange: undefined,
  status: CareerStatus.DRAFT,
  postedDate: undefined,
  expiryDate: undefined,
  metaTitle: "",
  metaDescription: "",
};

export const useCareerFormStore = create<CareerFormState>((set, get) => ({
  formData: initialFormData,
  errors: {},
  isSubmitting: false,
  mode: "create",
  careerId: null,

  setFormData: (data) => set({ formData: { ...get().formData, ...data } }),

  setField: (field, value) => {
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    }));
    get().clearError(field);
  },

  setContentSection: (field, section) => {
    set((state) => ({
      formData: {
        ...state.formData,
        [field]: { ...state.formData[field], ...section },
      },
    }));
  },

  addContentItem: (field) => {
    const currentSection = get().formData[field] as ContentSection;
    const items = currentSection?.items || [];
    set((state) => ({
      formData: {
        ...state.formData,
        [field]: {
          ...currentSection,
          items: [...items, ""],
        },
      },
    }));
  },

  updateContentItem: (field, index, value) => {
    const currentSection = get().formData[field] as ContentSection;
    const items = [...(currentSection?.items || [])];
    items[index] = value;
    set((state) => ({
      formData: {
        ...state.formData,
        [field]: {
          ...currentSection,
          items,
        },
      },
    }));
  },

  removeContentItem: (field, index) => {
    const currentSection = get().formData[field] as ContentSection;
    const items = currentSection?.items?.filter((_, i) => i !== index) || [];
    set((state) => ({
      formData: {
        ...state.formData,
        [field]: {
          ...currentSection,
          items,
        },
      },
    }));
  },

  setSalaryRange: (salary) => {
    set((state) => ({
      formData: {
        ...state.formData,
        salaryRange: {
          ...state.formData.salaryRange,
          ...salary,
        } as SalaryRange,
      },
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

  setMode: (mode, careerId) => set({ mode, careerId: careerId || null }),

  validateForm: () => {
    const { formData } = get();
    const newErrors: FormErrors = {};

    console.log("🔍 Validating form data:", formData);

    // Required field validations
    if (!formData.title?.trim()) {
      newErrors.title = "Job title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Job title must be at least 3 characters";
    }

    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    if (!formData.location?.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.type) {
      newErrors.type = "Employment type is required";
    }

    if (!formData.intro?.trim()) {
      newErrors.intro = "Job intro is required";
    } else if (formData.intro.trim().length < 10) {
      newErrors.intro = "Job intro must be at least 10 characters";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    // Content sections validation - Filter empty items
    const responsibilities = formData.responsibilities?.items?.filter((item) =>
      item.trim()
    );
    if (!responsibilities || responsibilities.length === 0) {
      newErrors.responsibilities = "At least one responsibility is required";
    }

    const requirements = formData.requirements?.items?.filter((item) =>
      item.trim()
    );
    if (!requirements || requirements.length === 0) {
      newErrors.requirements = "At least one requirement is required";
    }

    // Salary range validation (if provided)
    if (formData.salaryRange) {
      const { min, max, currency, period } = formData.salaryRange;
      if (min && max && min > max) {
        newErrors.salaryRange =
          "Minimum salary cannot be greater than maximum salary";
      }
      if ((min || max) && !currency) {
        newErrors["salaryRange.currency"] = "Currency is required";
      }
      if ((min || max) && !period) {
        newErrors["salaryRange.period"] = "Period is required";
      }
    }

    // Date validations
    if (formData.postedDate && formData.expiryDate) {
      const posted = new Date(formData.postedDate);
      const expiry = new Date(formData.expiryDate);
      if (posted > expiry) {
        newErrors.expiryDate = "Expiry date cannot be before posted date";
      }
    }

    console.log("❌ Validation errors:", newErrors);

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },

  resetForm: () =>
    set({
      formData: initialFormData,
      errors: {},
      isSubmitting: false,
      mode: "create",
      careerId: null,
    }),

  hydrateForm: (data) => {
    set({
      formData: {
        title: data.title || "",
        slug: data.slug || "",
        department: data.department,
        location: data.location || "",
        type: data.type,
        intro: data.intro || "",
        description: data.description || {
          title: "Job Description",
          content: "",
          items: [],
        },
        responsibilities: data.responsibilities || {
          title: "Key Responsibilities",
          items: [""],
        },
        requirements: data.requirements || {
          title: "Requirements",
          items: [""],
        },
        benefits: data.benefits || { title: "Benefits", items: [] },
        qualifications: data.qualifications || {
          title: "Qualifications",
          items: [],
        },
        salaryRange: data.salaryRange,
        status: data.status || CareerStatus.DRAFT,
        postedDate: data.postedDate,
        expiryDate: data.expiryDate,
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
      },
      errors: {},
    });
  },
}));
