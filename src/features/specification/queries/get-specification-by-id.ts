import "server-only";
import { dbConnect } from "@/lib/db/dbConnect";
import { SpecificationDefinition } from "@/models/Specification";
import type { ISpecificationDTO } from "../types";

export async function getSpecificationById(id: string): Promise<ISpecificationDTO | null> {
  await dbConnect();
  const s = await SpecificationDefinition.findById(id).lean();
  if (!s) return null;

  return {
    id: s._id.toString(),
    name: s.name,
    categoryId: s.categoryId.toString(),
    values: s.values,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}