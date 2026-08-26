import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const updateBrandSchema = createBrandSchema.partial().extend({
  id: z.string().min(1, "id is required"),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
