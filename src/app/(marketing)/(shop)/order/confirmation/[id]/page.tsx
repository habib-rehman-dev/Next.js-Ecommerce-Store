// src/app/(marketing)/(shop)/order/confirmation/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Package, Truck, Calendar, ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { Order } from "@/models/Order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

type Props = {
  params: Promise<{ id: string }>;
};

type OrderItem = {
  productName: string;
  sku: string;
  quantity: number;
  attributes?: Record<string, unknown>;
  lineTotal: number;
};

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params;
  const userId = await requireAuth();
  await dbConnect();

  const order = await Order.findOne({ _id: id, userId }).lean();

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold">Order Confirmed! 🎉</h1>
        <p className="text-muted-foreground mt-2">
          Thank you for your purchase. We&apos;ll send you a confirmation email shortly.
        </p>
        <Badge variant="outline" className="mt-2 font-mono">
          Order #{order._id.toString().slice(-8).toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{order.status}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <Truck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Shipping</p>
              <p className="font-medium">Processing</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Order Date</p>
              <p className="font-medium">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item: OrderItem, index: number) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.sku} × {item.quantity}
                    </p>
                    {Object.keys(item.attributes || {}).length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {Object.entries(item.attributes || {}).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="font-semibold">{formatPrice(item.lineTotal)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(order.shippingFee || 0)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              {order.couponCode && (
                <Badge variant="secondary" className="w-full justify-center">
                  Coupon: {order.couponCode}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-muted-foreground">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && (
                  <>, {order.shippingAddress.addressLine2}</>
                )}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-muted-foreground">{order.shippingAddress.country}</p>
              <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button >
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            View All Orders
          </Link>
        </Button>
      </div>
    </div>
  );
}