"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { dbConnect } from "@/lib/db/dbConnect";
import { Product } from "@/models/Product";
import { productSchema } from "../validation";
import { slugify } from "@/lib/slugify";
import { requireAdmin } from "@/lib/auth";
import { ActionResult } from "@/lib/action-result";
import { IProduct } from "../types";

export async function createProduct(
  inputData: unknown
): Promise<ActionResult<IProduct>> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Admin access required" };
  }

  try {
    await dbConnect();

    const validated = productSchema.safeParse(inputData);
    if (!validated.success) {
      return {
        success: false,
        message: "Validation failed",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const { name, slug, ...rest } = validated.data;
    const finalSlug = slug && slug.trim() !== "" ? slugify(slug) : slugify(name);

    const existingSlug = await Product.findOne({ slug: finalSlug });
    if (existingSlug) {
      return {
        success: false,
        message: "A product with this slug already exists.",
        fieldErrors: { slug: ["Slug is already taken"] },
      };
    }

    const newProduct = await Product.create({
      name,
      slug: finalSlug,
      ...rest,
    });

    revalidatePath("/admin/products");
    revalidateTag("products", "max");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newProduct)),
    };
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return {
        success: false,
        message: "Duplicate SKU or unique field detected across products.",
      };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create product.",
    };
  }
}