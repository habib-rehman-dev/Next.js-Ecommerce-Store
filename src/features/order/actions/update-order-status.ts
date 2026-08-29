"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Order } from "@/models/Order";
import { actionSuccess, actionError, type ActionResult } from "@/lib/action-result";
import type { OrderStatus } from "../types";

const VALID_STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

export async function updateOrderStatus(orderId: string, status: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return actionError("Admin access required");
  }

  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    return actionError("Invalid status");
  }

  await dbConnect();

  const updated = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
  if (!updated) return actionError("Order not found");

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidateTag("orders", "max");

  return actionSuccess(undefined, "Order status updated");
}