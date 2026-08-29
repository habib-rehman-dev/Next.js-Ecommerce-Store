import "server-only";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Order } from "@/models/Order";
import type { IOrderListItemDTO } from "../types";

type GetOrdersParams = {
  page?: number;
  limit?: number;
};

type GetOrdersResult = {
  orders: IOrderListItemDTO[];
  pagination: { total: number; pages: number; page: number; limit: number };
};

/**
 * Per-user, auth-gated — same reasoning as features/address/queries/get-addresses.ts
 * for why this doesn't use unstable_cache.
 */
export async function getOrders({
  page = 1,
  limit = 10,
}: GetOrdersParams = {}): Promise<GetOrdersResult> {
  const userId = await requireAuth();
  await dbConnect();

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments({ userId }),
  ]);

  const list: IOrderListItemDTO[] = orders.map((o) => ({
    id: o._id.toString(),
    itemCount: o.items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0),
    firstItemName: o.items[0]?.productName ?? "Order",
    total: o.total,
    currency: o.currency,
    status: o.status,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt.toISOString(),
  }));

  return {
    orders: list,
    pagination: { total, pages: Math.ceil(total / limit) || 1, page, limit },
  };
}