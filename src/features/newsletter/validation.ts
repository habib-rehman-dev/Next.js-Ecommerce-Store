import { z } from "zod";

export const newsletterSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(5, "Email is too short")
    .max(255, "Email is too long"),
  source: z
    .enum(["homepage", "footer", "popup", "checkout"])
    .optional()
    .default("homepage"),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;