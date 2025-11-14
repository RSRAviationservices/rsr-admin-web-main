import { z } from 'zod';

const availabilitySchema = z.object({
  status: z.enum(['in-stock', 'limited', 'lead-time', 'quote-only']),
  leadTime: z.string().optional().or(z.literal('')),
  minimumQuantity: z.number().min(0).optional().nullable(),
  allowAlternatives: z.boolean(),
});

const storageSchema = z.object({
  temperatureControlled: z.boolean(),
  hazmat: z.boolean(),
  shelfLife: z.string().optional().or(z.literal('')),
  storageInstructions: z.string().optional().or(z.literal('')),
});

const complianceSchema = z.object({
  certifications: z.array(z.string()).optional(),
  hasCoC: z.boolean(),
  hasSDS: z.boolean(),
  hasTDS: z.boolean(),
  militarySpec: z.string().optional().or(z.literal('')),
});

export const productFormSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  partNumber: z.string().min(1, 'Part number is required.'),
  brand: z.string().min(2, 'Brand is required.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  categorySlug: z.string({ error: 'Please select a category.' }).min(1, 'Category is required.'),
  subcategorySlug: z.string().min(1, 'Subcategory is required.'),
  // Add images field
  images: z
    .array(z.string().url())
    .min(1, 'At least one product image is required.')
    .max(5, 'Maximum 5 images allowed.'),
  tags: z.array(z.object({ value: z.string().min(1, 'Tag cannot be empty.') })).optional(),
  applications: z
    .array(z.object({ value: z.string().min(1, 'Application cannot be empty.') }))
    .optional(),
  availability: availabilitySchema,
  storage: storageSchema,
  compliance: complianceSchema,
  isActive: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
