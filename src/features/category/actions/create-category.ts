"use server";
import { revalidatePath, revalidateTag } from "next/cache";

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
    isFeatured: formData.get("isFeatured")?.toString() ?? "false",
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
      isFeatured: data.isFeatured,
      sortOrder: data.sortOrder,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidateTag("categories", "max");
    return { success: true, data: { id: category._id.toString() } };
  } catch {
    if (uploaded) {
      await deleteImageFromCloudinary(uploaded.publicId).catch((err) => {
        console.error("Failed to roll back orphaned Cloudinary upload:", err);
      });
    }
    return { success: false, message: "Failed to create category. Please try again." };
  }
}