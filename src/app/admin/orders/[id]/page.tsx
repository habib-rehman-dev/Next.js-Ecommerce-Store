import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Order } from "@/models/Order";
import { OrderDetail } from "@/features/order/components/OrderDetail";
import { OrderStatusSelect } from "@/features/order/components/OrderStatusSelect";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IOrderDTO } from "@/features/order/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  await dbConnect();
  const order = await Order.findById(id).lean();
  if (!order) notFound();

  const dto: IOrderDTO = {
    id: order._id.toString(),
    items: order.items.map((i) => ({
      productId: i.productId.toString(),
      variantId: i.variantId.toString(),
      productName: i.productName,
      sku: i.sku,
      attributes: (i.attributes ?? {}) as Record<string, string>,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      lineTotal: i.lineTotal,
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <Badge variant="outline" className="mt-1 font-mono">
              #{dto.id.slice(-8).toUpperCase()} · {order.userId.slice(-10)}
            </Badge>
          </div>
        </div>
        <OrderStatusSelect orderId={dto.id} status={dto.status} />
      </div>

      <OrderDetail order={dto} />
    </div>
  );
}