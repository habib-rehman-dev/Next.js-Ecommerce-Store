import "server-only";
import { dbConnect } from "@/lib/db/dbConnect";
import { SpecificationDefinition } from "@/models/Specification";
import "@/models/Category";
import type { ISpecificationDTO } from "../types";

/** Admin list — all definitions, newest category groupings first. */
export async function getSpecifications(): Promise<ISpecificationDTO[]> {
  await dbConnect();

  const specs = await SpecificationDefinition.find()
    .populate("categoryId", "name")
    .sort({ createdAt: -1 })
    .lean();

  return specs.map((s) => ({
    id: s._id.toString(),
    name: s.name,
    categoryId:
      s.categoryId && typeof s.categoryId === "object" && "_id" in s.categoryId
        ? String(s.categoryId._id)
        : String(s.categoryId),
    categoryName:
      s.categoryId && typeof s.categoryId === "object" && "name" in s.categoryId
        ? (s.categoryId as { name: string }).name
        : undefined,
    values: s.values,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
}