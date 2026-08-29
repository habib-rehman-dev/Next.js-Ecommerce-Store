import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { getOrderById } from "@/features/order/queries/get-order-by-id";
import { OrderDetail } from "@/features/order/components/OrderDetail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: Props) {
  try {
    await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Order Details</h1>
          <Badge variant="outline" className="mt-1 font-mono">
            Order #{order.id.slice(-8).toUpperCase()}
          </Badge>
        </div>
      </div>

      <OrderDetail order={order} />
    </div>
  );
}