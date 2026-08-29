"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { SpecificationDefinition } from "@/models/Specification";
import { Category } from "@/models/Category";
import { actionSuccess, actionError, type ActionResult } from "@/lib/action-result";
import { specificationSchema } from "../validation";

export async function createSpecification(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
  } catch {
    return actionError("Admin access required");
  }

  const raw = {
    name: formData.get("name")?.toString() ?? "",
    categoryId: formData.get("categoryId")?.toString() ?? "",
    values: formData.get("values")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "active",
  };

  const parsed = specificationSchema.safeParse(raw);
  if (!parsed.success) {
    return actionError("Please fix the errors below", parsed.error.flatten().fieldErrors);
  }
  const data = parsed.data;

  await dbConnect();

  const categoryExists = await Category.exists({ _id: data.categoryId });
  if (!categoryExists) {
    return actionError("Please fix the errors below", { categoryId: ["Category not found"] });
  }

  try {
    const spec = await SpecificationDefinition.create(data);
    revalidatePath("/admin/specifications");
    revalidateTag("specifications", "max");
    return actionSuccess({ id: spec._id.toString() }, "Specification created");
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return actionError("Please fix the errors below", {
        name: ["A specification with this name already exists for this category"],
      });
    }
    console.error("Failed to create specification:", error);
    return actionError("Failed to create specification. Please try again.");
  }
}