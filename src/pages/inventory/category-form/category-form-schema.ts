import { z } from 'zod'

export const categoryFormSchema = z.object({
  name: z.string().min(2, { message: 'Category name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  image: z
    .string()
    .url({ message: 'Please enter a valid image URL.' })
    .optional()
    .or(z.literal('')),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isActive: z.boolean()
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>
