import { z } from "zod";

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code cannot exceed 20 characters")
    .regex(/^[A-Z0-9_-]+$/i, "Only alphanumeric characters, dashes, and underscores allowed")
    .transform((val) => val.toUpperCase().trim()),
  discountType: z.enum(["percentage"], {
    error: "Discount type is required",
  }),
  discountValue: z.coerce
    .number()
    .min(1, "Percentage discount must be at least 1%")
    .max(100, "Percentage discount cannot exceed 100%"),
  minOrderValue: z.coerce
    .number()
    .min(0, "Minimum order value cannot be negative")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  maxUses: z.coerce
    .number()
    .min(1, "Max uses must be at least 1")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  expiresAt: z
    .string()
    .optional()
    .refine((val) => !val || new Date(val) > new Date(), {
      message: "Expiration date must be in the future",
    }),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type CouponFormInput = z.infer<typeof couponSchema>;