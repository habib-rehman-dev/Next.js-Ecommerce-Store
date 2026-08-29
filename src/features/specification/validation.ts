import { z } from "zod";

export const specificationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  categoryId: z.string().min(1, "Category is required"),
  // Comma-separated in the form, split/cleaned server-side
  values: z
    .string()
    .trim()
    .min(1, "Provide at least one value")
    .transform((val) =>
      val
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    ),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updateSpecificationSchema = specificationSchema.partial().extend({
  id: z.string().min(1, "id is required"),
});

export type SpecificationInput = z.infer<typeof specificationSchema>;
export type UpdateSpecificationInput = z.infer<typeof updateSpecificationSchema>;