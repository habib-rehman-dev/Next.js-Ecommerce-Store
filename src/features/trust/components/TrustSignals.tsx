"use client";

import {
  Truck,
  RotateCcw,
  Shield,
  Headphones,
  Star,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TrustSignal = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

type TrustSignalsProps = {
  className?: string;
  variant?: "grid" | "row" | "compact";
  signals?: TrustSignal[];
};

const defaultSignals: TrustSignal[] = [
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Free Shipping",
    description: "On orders over $50",
  },
  {
    icon: <RotateCcw className="h-6 w-6" />,
    title: "Easy Returns",
    description: "30-day money-back guarantee",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure Checkout",
    description: "SSL encrypted payments",
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: "24/7 Support",
    description: "Live chat & email support",
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: "Trusted Brand",
    description: "10,000+ happy customers",
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "All Major Cards",
    description: "Visa, Mastercard, Amex, PayPal",
  },
];

export function TrustSignals({
  className,
  variant = "grid",
  signals = defaultSignals,
}: TrustSignalsProps) {
  const displaySignals = variant === "compact" ? signals.slice(0, 4) : signals;

  return (
    <section className={cn("w-full py-6", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {variant === "row" ? (
          // Horizontal row variant
          <div className="flex flex-wrap justify-center items-center gap-8 divide-x divide-border/50">
            {displaySignals.map((signal, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-4 first:pl-0 last:pr-0"
              >
                <div className="text-primary/70">{signal.icon}</div>
                <div>
                  <p className="text-sm font-medium">{signal.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {signal.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : variant === "compact" ? (
          // Compact grid (4 items)
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {displaySignals.map((signal, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-card/50 hover:bg-card transition-colors border border-transparent hover:border-border"
              >
                <div className="text-primary/70 mb-2">{signal.icon}</div>
                <p className="text-sm font-medium">{signal.title}</p>
                <p className="text-xs text-muted-foreground">
                  {signal.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          // Default grid (full)
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {displaySignals.map((signal, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-card/30 hover:bg-card/60 transition-all hover:shadow-sm border border-transparent hover:border-border/50 group"
              >
                <div className="text-primary/60 group-hover:text-primary transition-colors mb-2">
                  {signal.icon}
                </div>
                <p className="text-sm font-medium text-foreground/90">
                  {signal.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {signal.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}