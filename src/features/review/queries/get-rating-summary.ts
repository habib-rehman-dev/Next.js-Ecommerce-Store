import "server-only";
import { Types } from "mongoose";
import { dbConnect } from "@/lib/db/dbConnect";
import { Review } from "@/models/Review";
import type { IRatingSummaryDTO } from "../types";

const emptySummary: IRatingSummaryDTO = {
  average: 0,
  count: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

/**
 * Single-product rating rollup — used on the product detail page (title
 * badge) and as the summary bar above the review list. For grids showing
 * many products at once, use get-rating-summaries.ts instead so it's one
 * aggregation query, not N.
 */
export async function getRatingSummary(productId: string): Promise<IRatingSummaryDTO> {
  await dbConnect();

  const [agg] = await Review.aggregate([
    { $match: { productId: new Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        average: { $avg: "$rating" },
        count: { $sum: 1 },
        r1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        r2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
        r3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
        r4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
        r5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
      },
    },
  ]);

  if (!agg) return emptySummary;

  return {
    average: Math.round(agg.average * 10) / 10,
    count: agg.count,
    distribution: { 1: agg.r1, 2: agg.r2, 3: agg.r3, 4: agg.r4, 5: agg.r5 },
  };
}