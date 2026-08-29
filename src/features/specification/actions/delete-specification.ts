"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { SpecificationDefinition } from "@/models/Specification";
import { actionSuccess, actionError, type ActionResult } from "@/lib/action-result";

export async function deleteSpecification(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return actionError("Admin access required");
  }
  if (!id) return actionError("Specification id is required");

  await dbConnect();

  const deleted = await SpecificationDefinition.findByIdAndDelete(id);
  if (!deleted) return actionError("Specification not found");

  revalidatePath("/admin/specifications");
  revalidateTag("specifications", "max");
  return actionSuccess(undefined, "Specification deleted");
}