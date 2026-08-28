"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { dbConnect } from "@/lib/db/dbConnect";
import { Product } from "@/models/Product";
import { productSchema } from "../validation";
import { slugify } from "@/lib/slugify";
import { requireAdmin } from "@/lib/auth";
import { ActionResult } from "@/lib/action-result";
import { deleteImageFromCloudinary } from "@/lib/cloudinary";
import { IProduct } from "../types";

export async function updateProduct(
  id: string,
  inputData: unknown
): Promise<ActionResult<IProduct>> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Admin access required" };
  }

  try {
    await dbConnect();

    if (!id) {
      return { success: false, message: "Product ID is required." };
    }

    const validated = productSchema.safeParse(inputData);
    if (!validated.success) {
      return {
        success: false,
        message: "Validation failed",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return { success: false, message: "Product not found." };
    }

    const { name, slug, imagePublicIds, ...rest } = validated.data;
    const finalSlug = slug && slug.trim() !== "" ? slugify(slug) : slugify(name);

    if (finalSlug !== existingProduct.slug) {
      const slugExists = await Product.findOne({ slug: finalSlug });
      if (slugExists) {
        return {
          success: false,
          message: "A product with this slug already exists.",
          fieldErrors: { slug: ["Slug is already taken"] },
        };
      }
    }

    // Handle Cloudinary cleanup for removed images
    const oldPublicIds: string[] = existingProduct.imagePublicIds || [];
    const currentPublicIds: string[] = imagePublicIds || [];
    const removedPublicIds = oldPublicIds.filter(
      (pubId) => !currentPublicIds.includes(pubId)
    );

    if (removedPublicIds.length > 0) {
      await Promise.all(
        removedPublicIds.map((pubId) => deleteImageFromCloudinary(pubId))
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        slug: finalSlug,
        imagePublicIds: currentPublicIds,
        ...rest,
      },
      { new: true, runValidators: true }
    );

    revalidatePath("/admin/products", "layout");
    revalidatePath(`/admin/products/${id}/edit`, "page");
    revalidateTag("products", "max");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedProduct)),
    };
  } catch (error: unknown) {
    console.error("Error updating product:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return {
        success: false,
        message: "SKU collision detected across products.",
      };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update product.",
    };
  }
}