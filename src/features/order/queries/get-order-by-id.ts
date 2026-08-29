import "server-only";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Order } from "@/models/Order";
import type { IOrderDTO } from "../types";

/**
 * Scoped to { _id, userId } — same guard as address queries, so one user
 * can't view another user's order by guessing an id.
 */
export async function getOrderById(id: string): Promise<IOrderDTO | null> {
  const userId = await requireAuth();
  await dbConnect();

  const order = await Order.findOne({ _id: id, userId }).lean();
  if (!order) return null;

  type LeanOrderItem = {
    productId: { toString(): string } | string;
    variantId: { toString(): string } | string;
    productName: string;
    sku: string;
    attributes?: Record<string, string>;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  };

  const orderItems = (order.items ?? []) as LeanOrderItem[];

  return {
    id: order._id.toString(),
    items: orderItems.map((item) => ({
      productId: item.productId.toString(),
      variantId: item.variantId.toString(),
      productName: item.productName,
      sku: item.sku,
      attributes: (item.attributes ?? {}) as Record<string, string>,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    shippingAddress: order.shippingAddress,
    subtotal: order.subtotal,
    discount: order.discount,
    couponCode: order.couponCode,
    shippingFee: order.shippingFee,
    total: order.total,
    currency: order.currency,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}