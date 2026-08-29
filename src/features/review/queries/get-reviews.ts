import "server-only";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db/dbConnect";
import { Review } from "@/models/Review";
import { User } from "@/models/User";
import { getRatingSummary } from "./get-rating-summary";
import type { IReviewDTO, IRatingSummaryDTO } from "../types";

type GetReviewsParams = {
  productId: string;
  page?: number;
  limit?: number;
};

type GetReviewsResult = {
  reviews: IReviewDTO[];
  summary: IRatingSummaryDTO;
  pagination: { total: number; pages: number; page: number; limit: number };
};

export async function getReviews({
  productId,
  page = 1,
  limit = 10,
}: GetReviewsParams): Promise<GetReviewsResult> {
  await dbConnect();

  const { userId: viewerId } = await auth();
  const skip = (page - 1) * limit;

  const [reviews, total, summary] = await Promise.all([
    Review.find({ productId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Review.countDocuments({ productId }),
    getRatingSummary(productId),
  ]);

  // Reviews only store the raw Clerk userId (same pattern as Address/Cart),
  // so join against the User collection we now sync via the Clerk webhook
  // to get display names. Falls back gracefully if a user's webhook sync
  // hasn't landed yet.
  const userIds = [...new Set(reviews.map((r) => r.userId))];
  const users = await User.find({ clerkId: { $in: userIds } })
    .select("clerkId firstName lastName")
    .lean();
  const nameMap = new Map(
    users.map((u) => [u.clerkId, [u.firstName, u.lastName].filter(Boolean).join(" ") || "Anonymous"])
  );

  const reviewDTOs: IReviewDTO[] = reviews.map((r) => ({
    id: r._id.toString(),
    userId: r.userId,
    userName: nameMap.get(r.userId) ?? "Anonymous",
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    isVerifiedPurchase: r.isVerifiedPurchase,
    createdAt: r.createdAt.toISOString(),
    isOwn: r.userId === viewerId,
  }));

  return {
    reviews: reviewDTOs,
    summary,
    pagination: { total, pages: Math.ceil(total / limit) || 1, page, limit },
  };
}