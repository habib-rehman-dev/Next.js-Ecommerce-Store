import "server-only";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Order } from "@/models/Order";
import type { IOrderListItemDTO } from "../types";

type GetAdminOrdersParams = {
  page?: number;
  limit?: number;
  status?: string;
};

export async function getAdminOrders({
  page = 1,
  limit = 15,
  status,
}: GetAdminOrdersParams = {}) {
  await requireAdmin();
  await dbConnect();

  const query: Record<string, unknown> = {};
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(query),
  ]);

  const list: (IOrderListItemDTO & { userId: string })[] = orders.map((o) => ({
    id: o._id.toString(),
    userId: o.userId,
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