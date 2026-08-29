"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db/dbConnect";
import { Review } from "@/models/Review";
import { Product } from "@/models/Product";
import { actionSuccess, actionError, type ActionResult } from "@/lib/action-result";

export async function deleteReview(reviewId: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return actionError("Please sign in");
  if (!reviewId) return actionError("Review id is required");

  await dbConnect();

  const review = await Review.findById(reviewId);
  if (!review) return actionError("Review not found");

  const isOwner = review.userId === userId;
  let isAdmin = false;
  if (!isOwner) {
    const user = await currentUser();
    isAdmin = user?.publicMetadata?.role === "admin";
  }

  if (!isOwner && !isAdmin) {
    return actionError("You can only delete your own reviews");
  }

  const product = await Product.findById(review.productId).select("slug").lean();

  await Review.findByIdAndDelete(reviewId);

  if (product) revalidatePath(`/products/${product.slug}`);
  revalidateTag("reviews", "max");

  return actionSuccess(undefined, "Review deleted");
}