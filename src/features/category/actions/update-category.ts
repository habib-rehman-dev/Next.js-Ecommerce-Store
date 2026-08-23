"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { slugify } from "@/lib/slugify";
import { Category } from "@/models/Category";
import type { ActionResult } from "@/lib/action-result";
import { updateCategorySchema } from "../validation";
import { getUploadedImageFile, validateImageFile } from "@/lib/image-validation";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/lib/cloudinary";

const CLOUDINARY_FOLDER = "commerce-store/categories";

export async function updateCategory(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Admin access required" };
  }

  const raw = {
    id: formData.get("id")?.toString() ?? "",
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    parentCategoryId: formData.get("parentCategoryId")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "active",
    sortOrder: formData.get("sortOrder")?.toString() ?? "0",
  };

  const parsed = updateCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { id, ...data } = parsed.data;

  // A new file only shows up here if the admin actually picked a
  // replacement — leaving the file input untouched means "keep the
  // existing image", not "delete it".
  const imageFile = getUploadedImageFile(formData);
  if (imageFile) {
    const imageError = validateImageFile(imageFile);
    if (imageError) {
      return {
        success: false,
        message: "Please fix the errors below",
        fieldErrors: { image: [imageError] },
      };
    }
  }

  await dbConnect();

  const existing = await Category.findById(id);
  if (!existing) {
    return { success: false, message: "Category not found" };
  }

  // A category can't be its own parent, directly or transitively.
  if (data.parentCategoryId) {
    if (data.parentCategoryId === id) {
      return {
        success: false,
        message: "Please fix the errors below",
        fieldErrors: { parentCategoryId: ["A category can't be its own parent"] },
      };
    }
    const parentExists = await Category.exists({ _id: data.parentCategoryId });
    if (!parentExists) {
      return {
        success: false,
        message: "Please fix the errors below",
        fieldErrors: { parentCategoryId: ["Parent category not found"] },
      };
    }
  }

  let slug = existing.slug;
  if (data.slug) {
    slug = data.slug;
  } else if (data.name && data.name !== existing.name) {
    slug = slugify(data.name);
  }

  if (slug !== existing.slug) {
    const slugTaken = await Category.exists({ slug, _id: { $ne: id } });
    if (slugTaken) {
      return {
        success: false,
        message: "Please fix the errors below",
        fieldErrors: { slug: ["A category with this slug already exists"] },
      };
    }
  }

  // Every validation/DB precondition above has passed — only now do we
  // touch Cloudinary, and only if a replacement image was actually sent.
  let uploaded: { url: string; publicId: string } | null = null;
  if (imageFile) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    uploaded = await uploadImageToCloudinary(buffer, CLOUDINARY_FOLDER);
  }

  const previousImagePublicId = existing.imagePublicId;

  existing.set({
    ...(data.name !== undefined && { name: data.name }),
    slug,
    ...(data.description !== undefined && { description: data.description || undefined }),
    ...(data.parentCategoryId !== undefined && {
      parentCategoryId: data.parentCategoryId || null,
    }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    ...(uploaded && { image: uploaded.url, imagePublicId: uploaded.publicId }),
  });

  try {
    await existing.save();
  } catch {
    // The new image made it to Cloudinary but the save failed. Roll back
    // the new upload — the OLD image is still referenced by the untouched
    // document in the DB, so it must NOT be deleted here.
    if (uploaded) {
      await deleteImageFromCloudinary(uploaded.publicId).catch((err) => {
        console.error("Failed to roll back orphaned Cloudinary upload:", err);
      });
    }
    return { success: false, message: "Failed to update category. Please try again." };
  }

  // Only delete the old image once the new one is safely saved. Doing this
  // before the save (or if the save fails) could leave the category with
  // no image at all if something went wrong in between.
  if (uploaded && previousImagePublicId) {
    await deleteImageFromCloudinary(previousImagePublicId).catch((err) => {
      console.error("Failed to delete previous category image from Cloudinary:", err);
    });
  }

  revalidatePath("/admin/categories");

  return { success: true, data: { id } };
}
