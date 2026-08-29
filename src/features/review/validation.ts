import { z } from "zod";

export const reviewSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  rating: z.coerce.number().int().min(1, "Please select a rating").max(5),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  comment: z.string().trim().min(10, "Review must be at least 10 characters").max(2000),
});

export type ReviewInput = z.infer<typeof reviewSchema>;