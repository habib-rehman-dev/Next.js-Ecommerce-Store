import "server-only";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db/dbConnect";
import { Review } from "@/models/Review";

/** Whether the signed-in user has already reviewed this product. */
export async function getUserReviewForProduct(productId: string): Promise<{ id: string } | null> {
  const { userId } = await auth();
  if (!userId) return null;

  await dbConnect();
  const existing = await Review.findOne({ userId, productId }).select("_id").lean();
  return existing ? { id: existing._id.toString() } : null;
}