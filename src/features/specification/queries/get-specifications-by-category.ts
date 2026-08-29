import "server-only";
import { dbConnect } from "@/lib/db/dbConnect";
import { SpecificationDefinition } from "@/models/Specification";

export type SuggestedSpec = { name: string; values: string[] };

/** Active specs for one category — used by ProductForm's suggestion chips. */
export async function getSpecificationsByCategory(categoryId: string): Promise<SuggestedSpec[]> {
  if (!categoryId) return [];
  await dbConnect();

  const specs = await SpecificationDefinition.find({ categoryId, status: "active" })
    .select("name values")
    .lean();

  return specs.map((s) => ({ name: s.name, values: s.values }));
}