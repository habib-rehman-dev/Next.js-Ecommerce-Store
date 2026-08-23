"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { slugify } from "@/lib/slugify";
import { Category } from "@/models/Category";
import type { ActionResult } from "@/lib/action-result";
import { createCategorySchema } from "../validation";
import { getUploadedImageFile, validateImageFile } from "@/lib/image-validation";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/lib/cloudinary";

const CLOUDINARY_FOLDER = "commerce-store/categories";

export async function createCategory(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Admin access required" };
  }

  const raw = {
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    parentCategoryId: formData.get("parentCategoryId")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "active",
    sortOrder: formData.get("sortOrder")?.toString() ?? "0",
  };

  const parsed = createCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  // Validate the image BEFORE touching the database or Cloudinary — a
  // request that was never going to succeed should never trigger an upload.
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

  const slug = data.slug ? data.slug : slugify(data.name);

  const slugTaken = await Category.exists({ slug });
  if (slugTaken) {
    return {
      success: false,
      message: "Please fix the errors below",
      fieldErrors: { slug: ["A category with this slug already exists"] },
    };
  }

  if (data.parentCategoryId) {
    const parentExists = await Category.exists({ _id: data.parentCategoryId });
    if (!parentExists) {
      return {
        success: false,
        message: "Please fix the errors below",
        fieldErrors: { parentCategoryId: ["Parent category not found"] },
      };
    }
  }

  // Every precondition above has passed at this point — this is the only
  // place in the function that talks to Cloudinary.
  let uploaded: { url: string; publicId: string } | null = null;
  if (imageFile) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    uploaded = await uploadImageToCloudinary(buffer, CLOUDINARY_FOLDER);
  }

  try {
    const category = await Category.create({
      name: data.name,
      slug,
      description: data.description || undefined,
      image: uploaded?.url,
      imagePublicId: uploaded?.publicId,
      parentCategoryId: data.parentCategoryId || null,
      status: data.status,
      sortOrder: data.sortOrder,
    });

    revalidatePath("/admin/categories");
    return { success: true, data: { id: category._id.toString() } };
  } catch {
    // The image made it to Cloudinary but the DB write failed (race on the
    // slug unique index, a Mongoose validation error, etc.) — clean up
    // rather than leave it orphaned.
    if (uploaded) {
      await deleteImageFromCloudinary(uploaded.publicId).catch((err) => {
        console.error("Failed to roll back orphaned Cloudinary upload:", err);
      });
    }
    return { success: false, message: "Failed to create category. Please try again." };
  }
}
