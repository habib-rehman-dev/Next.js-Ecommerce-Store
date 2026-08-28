import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  variantId: z.string().min(1, "Variant is required"),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export const updateCartItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const removeCartItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>;