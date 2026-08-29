// src/app/(marketing)/(shop)/checkout/CheckoutClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CreditCard,
  MapPin,
  Plus,
  Loader2,
  Check,
  ChevronRight,
  Shield,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import { createPaymentIntent } from "@/features/payment/actions/create-payment-intent";
import { confirmOrder } from "@/features/payment/actions/confirm-order";
import { createAddress } from "@/features/address/actions/create-address";
import { AddressInput } from "@/features/address/validation";
import type { ICartDTO } from "@/features/cart/types";
import type { IAddressDTO } from "@/features/address/types";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Format price
function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

type Props = {
  cart: ICartDTO;
  addresses: IAddressDTO[];
};

// Custom Card Element Styles
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
      padding: "10px",
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

function CheckoutForm({ cart, addresses }: Props) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Address form state
  const [newAddress, setNewAddress] = useState<AddressInput>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    isDefault: false,
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const subtotal = cart.subtotal;
  const shipping = 0;
  const total = subtotal + shipping;

  // Reset card error when user types
  useEffect(() => {
    if (paymentError) setPaymentError(null);
  }, [paymentError]);

  const handlePlaceOrder = async () => {
    if (!stripe || !elements) {
      toast.error("Payment system not ready");
      return;
    }

    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    if (!cardComplete) {
      toast.error("Please enter your payment details");
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    try {
      // 1. Create Payment Intent
      const paymentIntentResult = await createPaymentIntent(shipping);
      if (!paymentIntentResult.success) {
        toast.error(paymentIntentResult.message);
        setIsLoading(false);
        return;
      }

      // 2. Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast.error("Payment form not ready");
        setIsLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentResult.data!.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: selectedAddress?.fullName || "Customer",
              email: "customer@example.com", // You can get this from user session
              phone: selectedAddress?.phone || "",
              address: {
                line1: selectedAddress?.addressLine1 || "",
                line2: selectedAddress?.addressLine2 || "",
                city: selectedAddress?.city || "",
                state: selectedAddress?.state || "",
                postal_code: selectedAddress?.postalCode || "",
                country: selectedAddress?.country || "",
              },
            },
          },
        }
      );

      if (error) {
        setPaymentError(error.message || "Payment failed");
        toast.error(error.message || "Payment failed");
        setIsLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        // 3. Confirm order in database
        const orderResult = await confirmOrder({
          paymentIntentId: paymentIntent.id,
          shippingAddressId: selectedAddressId,
          couponCode: appliedCoupon || undefined,
        });

        if (!orderResult.success) {
          toast.error(orderResult.message);
          setIsLoading(false);
          return;
        }

        toast.success("Order placed successfully! 🎉");
        router.push(`/order/confirmation/${orderResult.data!.orderId}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      setPaymentError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(newAddress).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const result = await createAddress(formData);
    if (result.success) {
      toast.success("Address saved");
      setShowAddressForm(false);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  if (addresses.length === 0 && !showAddressForm) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No Address Found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Please add a shipping address to continue
        </p>
        <Button className="mt-4" onClick={() => setShowAddressForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Address
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Address + Payment */}
      <div className="lg:col-span-2 space-y-6">
        {/* Address Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAddressForm ? (
              <form onSubmit={handleCreateAddress} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      required
                      value={newAddress.fullName}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, fullName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      required
                      value={newAddress.phone}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Address Line 1</Label>
                  <Input
                    required
                    value={newAddress.addressLine1}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, addressLine1: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Address Line 2 (Optional)</Label>
                  <Input
                    value={newAddress.addressLine2}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, addressLine2: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <Label>City</Label>
                    <Input
                      required
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      required
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Postal Code</Label>
                    <Input
                      required
                      value={newAddress.postalCode}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, postalCode: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Country</Label>
                  <Input
                    required
                    value={newAddress.country}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, country: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={newAddress.isDefault}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, isDefault: e.target.checked })
                    }
                  />
                  <Label htmlFor="isDefault" className="text-sm">
                    Set as default address
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Save Address</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddressForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <Select
                  value={selectedAddressId}
                  onValueChange={(value) => {
                    if (value) setSelectedAddressId(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shipping address" />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map((addr) => (
                      <SelectItem key={addr.id} value={addr.id}>
                        {addr.fullName} - {addr.addressLine1}, {addr.city}
                        {addr.isDefault && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Default
                          </Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddressForm(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add New Address
                </Button>

                {selectedAddress && (
                  <div className="mt-2 p-3 bg-muted/30 rounded-lg text-sm">
                    <p className="font-medium">{selectedAddress.fullName}</p>
                    <p className="text-muted-foreground">
                      {selectedAddress.addressLine1}
                      {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedAddress.city}, {selectedAddress.state}{" "}
                      {selectedAddress.postalCode}
                    </p>
                    <p className="text-muted-foreground">{selectedAddress.country}</p>
                    <p className="text-muted-foreground">{selectedAddress.phone}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Section - IMPROVED */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Test Card Info - Helpful for development */}
              <div className="p-3 bg-muted/30 rounded-lg border border-dashed border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  💳 Test Card (Development)
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="bg-muted px-2 py-0.5 rounded">4242 4242 4242 4242</span>
                  <span className="bg-muted px-2 py-0.5 rounded">12/34</span>
                  <span className="bg-muted px-2 py-0.5 rounded">123</span>
                </div>
              </div>

              {/* Card Element */}
              <div className="p-4 border rounded-lg bg-background transition-all focus-within:ring-2 focus-within:ring-primary/50">
                <CardElement
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={(event) => {
                    setCardComplete(event.complete);
                    if (event.error) {
                      setPaymentError(event.error.message);
                    } else {
                      setPaymentError(null);
                    }
                  }}
                />
              </div>

              {/* Payment Error */}
              {paymentError && (
                <p className="text-sm text-destructive">{paymentError}</p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Your payment information is secure and encrypted.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Items Preview */}
            <ScrollArea className="max-h-48">
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                      {item.productImage && (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatPrice((item.discountPrice || item.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            {/* Coupon Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={!!appliedCoupon}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (appliedCoupon) {
                    setAppliedCoupon(null);
                    setCouponCode("");
                  } else if (couponCode) {
                    setAppliedCoupon(couponCode);
                  }
                }}
              >
                {appliedCoupon ? "Remove" : "Apply"}
              </Button>
            </div>

            {appliedCoupon && (
              <Badge variant="secondary" className="gap-1">
                <Check className="h-3 w-3" /> {appliedCoupon} applied
              </Badge>
            )}

            <Separator />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(subtotal * 0.1)}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={isLoading || !selectedAddressId || !stripe || !cardComplete}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Pay {formatPrice(total)}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By placing this order, you agree to our Terms of Service
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Wrap with Elements provider
export function CheckoutClient(props: Props) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}