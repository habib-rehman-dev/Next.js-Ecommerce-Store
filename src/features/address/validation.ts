// src/features/address/validation.ts
import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  addressLine1: z.string().trim().min(3, "Address is required").max(200),
  addressLine2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2, "City is required").max(100),
  state: z.string().trim().min(2, "State is required").max(100),
  postalCode: z.string().trim().min(3, "Postal code is required").max(20),
  country: z.string().trim().min(2, "Country is required").max(100),
  // NOTE: kept as a real boolean (not z.coerce.boolean()) — coercing the
  // string "false" would evaluate truthy and always flip this to true.
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = addressSchema.partial().extend({
  id: z.string().min(1, "id is required"),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;