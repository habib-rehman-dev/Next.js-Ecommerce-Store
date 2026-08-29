import "server-only";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Review } from "@/models/Review";
import "@/models/Product";
import { User } from "@/models/User";

export type AdminReviewRow = {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
};

type GetAdminReviewsParams = { page?: number; limit?: number };

export async function getAdminReviews({ page = 1, limit = 20 }: GetAdminReviewsParams = {}) {
  await requireAdmin();
  await dbConnect();

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find()
      .populate("productId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(),
  ]);

  const userIds = [...new Set(reviews.map((r) => r.userId))];
  const users = await User.find({ clerkId: { $in: userIds } })
    .select("clerkId firstName lastName")
    .lean();
  const nameMap = new Map(
    users.map((u) => [u.clerkId, [u.firstName, u.lastName].filter(Boolean).join(" ") || "Anonymous"])
  );

  const rows: AdminReviewRow[] = reviews.map((r) => ({
    id: r._id.toString(),
    productId:
      r.productId && typeof r.productId === "object" && "_id" in r.productId
        ? String(r.productId._id)
        : String(r.productId),
    productName:
      r.productId && typeof r.productId === "object" && "name" in r.productId
        ? (r.productId as { name: string }).name
        : "Deleted product",
    userId: r.userId,
    userName: nameMap.get(r.userId) ?? "Anonymous",
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    isVerifiedPurchase: r.isVerifiedPurchase,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    reviews: rows,
    pagination: { total, pages: Math.ceil(total / limit) || 1, page, limit },
  };
}