"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import type { ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/cloudinary";
import { getUploadedImageFile, validateImageFile } from "@/lib/image-validation";
import { slugify } from "@/lib/slugify";
import { Brand } from "@/models/Brand";

import { updateBrandSchema } from "../validation";

const CLOUDINARY_FOLDER = "commerce-store/brands";

export async function updateBrand(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Admin access required" };
  }

  const id = formData.get("id")?.toString() ?? "";
  if (!id) {
    return { success: false, message: "Brand id is required" };
  }

  await dbConnect();

  const existing = await Brand.findById(id);
  if (!existing) {
    return { success: false, message: "Brand not found" };
  }

  const raw = {
    id,
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "active",
    // The form doesn't submit sortOrder — fall back to the current value so
    // it doesn't silently reset to the schema's default.
    sortOrder: formData.get("sortOrder")?.toString() ?? String(existing.sortOrder ?? 0),
  };

  const parsed = updateBrandSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  const deleteExistingLogo = formData.get("deleteExistingLogo") === "true";
  const imageFile = getUploadedImageFile(formData, "logo");
  if (imageFile) {
    const imageError = validateImageFile(imageFile);
    if (imageError) {
      return {
        success: false,
        message: "Please fix the errors below",
        fieldErrors: { logo: [imageError] },
      };
    }
  }

  let slug = existing.slug;
  if (data.slug) {
    slug = slugify(data.slug);
  } else if (data.name && data.name !== existing.name) {
    slug = slugify(data.name);
  }

  if (slug !== existing.slug) {
    const slugTaken = await Brand.exists({ slug, _id: { $ne: id } });
    if (slugTaken) {
      return {
        success: false,
        message: "Please fix the errors below",
        fieldErrors: { slug: ["A brand with this slug already exists"] },
      };
    }
  }

  // Only touch Cloudinary once every other precondition has passed.
  let uploaded: { url: string; publicId: string } | null = null;
  if (imageFile) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    uploaded = await uploadImageToCloudinary(buffer, CLOUDINARY_FOLDER);
  }

  const previousLogoPublicId = existing.logoPublicId;

  existing.set({
    ...(data.name !== undefined && { name: data.name }),
    slug,
    ...(data.description !== undefined && { description: data.description || undefined }),
    ...(data.status !== undefined && { status: data.status }),
    ...(uploaded && { logo: uploaded.url, logoPublicId: uploaded.publicId }),
    ...(!uploaded && deleteExistingLogo && { logo: undefined, logoPublicId: "" }),
  });

  try {
    await existing.save();
  } catch (error) {
    // New logo made it to Cloudinary but the save failed — roll it back.
    // The OLD logo is still referenced by the untouched document, so leave it.
    if (uploaded) {
      await deleteImageFromCloudinary(uploaded.publicId).catch((err) => {
        console.error("Failed to roll back orphaned Cloudinary upload:", err);
      });
    }
    console.error("Failed to update brand:", error);
    return { success: false, message: "Failed to update brand. Please try again." };
  }

  // Delete the old logo only after the new state is safely saved.
  if ((uploaded || deleteExistingLogo) && previousLogoPublicId) {
    await deleteImageFromCloudinary(previousLogoPublicId).catch((err) => {
      console.error("Failed to delete previous brand logo from Cloudinary:", err);
    });
  }

//   revalidatePath("/admin/brands");
//   revalidateTag("brands");

//   return { success: true, data: { id } };
// }

  revalidatePath("/admin/brands");
  revalidateTag("brands", "max");

  return { success: true, data: { id } };
}