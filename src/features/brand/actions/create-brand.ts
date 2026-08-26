"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import type { ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/cloudinary";
import { getUploadedImageFile, validateImageFile } from "@/lib/image-validation";
import { slugify } from "@/lib/slugify";
import { Brand } from "@/models/Brand";

import { createBrandSchema } from "../validation";

const CLOUDINARY_FOLDER = "commerce-store/brands";

export async function createBrand(
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
    status: formData.get("status")?.toString() ?? "active",
    sortOrder: formData.get("sortOrder")?.toString() ?? "0",
  };

  const parsed = createBrandSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
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

  await dbConnect();

  let uploaded: { url: string; publicId: string } | null = null;

  try {
    const slug = data.slug ? data.slug : slugify(data.name);

    const slugTaken = await Brand.exists({ slug });
    if (slugTaken) {
      return {
        success: false,
        message: "Please fix the errors below",
        fieldErrors: { slug: ["A brand with this slug already exists"] },
      };
    }

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      uploaded = await uploadImageToCloudinary(buffer, CLOUDINARY_FOLDER);
    }

    const brand = await Brand.create({
      name: data.name,
      slug,
      description: data.description || undefined,
      logo: uploaded?.url,
      logoPublicId: uploaded?.publicId ?? "",
      status: data.status,
      sortOrder: data.sortOrder,
    });

    revalidatePath("/admin/brands");
    revalidateTag("brands", "max");
    return { success: true, data: { id: brand._id.toString() } };
  } catch (error) {
    if (uploaded) {
      await deleteImageFromCloudinary(uploaded.publicId).catch((err) => {
        console.error("Failed to roll back orphaned Cloudinary upload:", err);
      });
    }

    console.error("Failed to create brand:", error);
    return { success: false, message: "Failed to create brand. Please try again." };
  }
}
