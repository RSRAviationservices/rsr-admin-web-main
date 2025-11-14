import { z } from "zod";

import { AdminRole, AdminStatus } from "@/types/admin";

// Base schema that's common for both modes
const baseSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Username can only contain letters, numbers, dots, underscores, and hyphens"
    )
    .toLowerCase(),
  role: z.nativeEnum(AdminRole),
  status: z.nativeEnum(AdminStatus),
  permissions: z
    .array(
      z.object({
        resource: z.string(),
        actions: z
          .array(z.string())
          .min(1, "At least one action must be selected"),
      })
    )
    .min(1, "At least one permission must be granted"),
});

// Create schema for mode
const createSchema = baseSchema
  .extend({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Edit schema for mode
const editSchema = baseSchema
  .extend({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      )
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // If password is provided, confirmPassword must match
      if (data.password && data.password !== "") {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );

// Export function that returns the correct schema based on mode
export function getAdminFormSchema(mode: "create" | "edit") {
  return mode === "create" ? createSchema : editSchema;
}

// Export types
export type AdminFormDataCreate = z.infer<typeof createSchema>;
export type AdminFormDataEdit = z.infer<typeof editSchema>;
