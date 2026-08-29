"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Review } from "@/models/Review";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { actionSuccess, actionError, type ActionResult } from "@/lib/action-result";
import { reviewSchema } from "../validation";

export async function createReview(formData: FormData): Promise<ActionResult<{ id: string }>> {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return actionError("Please sign in to leave a review");
  }

  const raw = {
    productId: formData.get("productId")?.toString() ?? "",
    rating: formData.get("rating")?.toString() ?? "",
    title: formData.get("title")?.toString() ?? "",
    comment: formData.get("comment")?.toString() ?? "",
  };

  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) {
    return actionError("Please fix the errors below", parsed.error.flatten().fieldErrors);
  }
  const { productId, rating, title, comment } = parsed.data;

  await dbConnect();

  const product = await Product.findById(productId).select("_id slug").lean();
  if (!product) return actionError("Product not found");

  const alreadyReviewed = await Review.exists({ userId, productId });
  if (alreadyReviewed) {
    return actionError("You've already reviewed this product");
  }

  // Verified purchase badge: any paid order containing this product for this user.
  const hasPurchased = await Order.exists({
    userId,
    paymentStatus: "paid",
    "items.productId": productId,
  });

  try {
    const review = await Review.create({
      userId,
      productId,
      rating,
      title: title || undefined,
      comment,
      isVerifiedPurchase: Boolean(hasPurchased),
    });

    revalidatePath(`/products/${product.slug}`);
    revalidateTag("reviews", "max");

    return actionSuccess({ id: review._id.toString() }, "Review submitted");
  } catch (error: unknown) {
    // The unique (userId, productId) index is the backstop against a race
    // between the exists() check above and this insert.
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return actionError("You've already reviewed this product");
    }
    console.error("Failed to create review:", error);
    return actionError("Failed to submit review. Please try again.");
  }
}