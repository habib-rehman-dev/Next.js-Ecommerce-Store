import "server-only";
import { Types } from "mongoose";
import { dbConnect } from "@/lib/db/dbConnect";
import { Review } from "@/models/Review";
import type { IProductRatingDTO } from "../types";

/**
 * Batch rollup for product grids (storefront listing, related products,
 * homepage sections) — one aggregation query for the whole page instead of
 * one per card. Returns a map keyed by productId; products with no reviews
 * simply won't have a key, so callers should treat a missing entry as "no
 * rating yet" rather than zero.
 */
export async function getRatingSummaries(
  productIds: string[]
): Promise<Record<string, IProductRatingDTO>> {
  if (productIds.length === 0) return {};
  await dbConnect();

  const objectIds = productIds.map((id) => new Types.ObjectId(id));

  const results = await Review.aggregate([
    { $match: { productId: { $in: objectIds } } },
    { $group: { _id: "$productId", average: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const map: Record<string, IProductRatingDTO> = {};
  for (const r of results) {
    map[r._id.toString()] = { average: Math.round(r.average * 10) / 10, count: r.count };
  }
  return map;
}