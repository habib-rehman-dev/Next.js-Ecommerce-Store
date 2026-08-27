
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Copy, Check, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type HeroBannerData = {
  _id: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
  badgeText?: string;
  couponCode?: string;
  imageUrl: string;
};

export function HeroBannerSection({ banner }: { banner: HeroBannerData }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!banner.couponCode) return;
    navigator.clipboard.writeText(banner.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-card border shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 lg:p-12">
        
        {/* Left Content */}
        <div className="lg:col-span-7 space-y-6 ">
          {banner.badgeText && (
            <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              {banner.badgeText}
            </Badge>
          )}

          <h1 className="text-4xl  sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {banner.title}
          </h1>

          {banner.subtitle && (
            <p className="text-lg text-muted-foreground max-w-xl">
              {banner.subtitle}
            </p>
          )}

          {/* Optional Coupon Code Box */}
          {banner.couponCode && (
            <div className="inline-flex items-center gap-3 p-2 pr-4 bg-muted/60 border rounded-xl">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-background rounded-lg text-sm font-mono font-bold text-primary border">
                <Tag className="h-3.5 w-3.5" />
                {banner.couponCode}
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleCopy}
                className="gap-1 text-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy Code"}
              </Button>
            </div>
          )}

          {/* Call to Action */}
          <div className="">
            <Button size="lg" className="rounded-xl gap-2 font-medium shadow-md" >
              <Link href={banner.ctaLink} className="flex  justify-center items-center gap-3 rounded-sm!">
                {banner.ctaText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Image Display */}
        <div className="lg:col-span-5 relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-muted">
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            priority
            className="object-cover"
          />
        </div>

      </div>
    </section>
  );
}