import { z } from "zod";

export const variantSchema = z.object({
  sku: z.string().min(1, "SKU is required").toUpperCase(),
  attributes: z.record(z.string(), z.string()).default({}),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  discountPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0, "Stock must be 0 or higher"),
  images: z.array(z.string()).default([]),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  status: z.enum(["active", "inactive"]).default("active"),
  isFeatured: z.coerce.boolean().default(false),
  images: z.array(z.string()).default([]),
  imagePublicIds: z.array(z.string()).default([]),
  variants: z
    .array(variantSchema)
    .min(1, "At least one product variant is required"),
});

export type ProductInput = z.infer<typeof productSchema>;