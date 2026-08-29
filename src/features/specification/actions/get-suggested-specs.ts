"use server";

import { getSpecificationsByCategory, type SuggestedSpec } from "../queries/get-specifications-by-category";

export async function getSuggestedSpecsAction(categoryId: string): Promise<SuggestedSpec[]> {
  return getSpecificationsByCategory(categoryId);
}