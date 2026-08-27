"use client";

import { useState } from "react";
import { Mail, Check, Loader2, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";

import { subscribeToNewsletter } from "../actions/subscribe";
import { newsletterSchema, NewsletterInput } from "../validation";

type NewsletterFormInput = z.input<typeof newsletterSchema>;

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type NewsletterSectionProps = {
  className?: string;
  variant?: "default" | "compact" | "footer";
  source?: "homepage" | "footer" | "popup" | "checkout";
};

export function NewsletterSection({
  className,
  variant = "default",
  source = "homepage",
}: NewsletterSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormInput, unknown, NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
      source,
    },
  });

  const onSubmit = async (data: NewsletterInput) => {
    setIsSubmitting(true);

    try {
      const result = await subscribeToNewsletter(data);

      if (result.success) {
        setIsSuccess(true);
        toast.success(result.message || "Subscribed successfully!");
        reset();
        // Reset success state after 5 seconds
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        toast.error(result.message || "Failed to subscribe");
        if (result.fieldErrors?.email) {
          // The error is already displayed in the form
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compact variant for footer
  if (variant === "compact") {
    return (
      <div className={cn("space-y-3", className)}>
        <p className="text-sm text-muted-foreground">
          Subscribe for exclusive offers & updates
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              disabled={isSubmitting || isSuccess}
              className="h-9 text-sm"
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || isSuccess}
            className="shrink-0"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              "Subscribe"
            )}
          </Button>
        </form>
      </div>
    );
  }

  // Default homepage variant
  return (
    <section className={cn("w-full py-8", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden border-primary/10 bg-linear-to-br from-primary/5 via-background to-primary/5">
          {/* Decorative element */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

          <CardContent className="relative p-8 sm:p-12">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto gap-6">
              {/* Badge */}
              <Badge variant="outline" className="gap-1.5 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5" />
                Stay Updated
              </Badge>

              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Join the <span className="text-primary">Community</span>
                </h2>
                <p className="text-muted-foreground text-balance max-w-md mx-auto">
                  Subscribe to get exclusive offers, early access to new
                  collections, and 10% off your first order!
                </p>
              </div>

              {/* Success State */}
              {isSuccess ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="rounded-full bg-green-500/10 p-3">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-lg font-medium text-green-600 dark:text-green-400">
                    You&apos;re subscribed! 🎉
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check your inbox for a confirmation email.
                  </p>
                </div>
              ) : (
                /* Form */
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="w-full max-w-md space-y-3"
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Label htmlFor="email" className="sr-only">
                        Email address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          className="pl-9 h-11"
                          {...register("email")}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-destructive mt-1.5 text-left">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="shrink-0 sm:min-w-32"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          Subscribe
                          <span className="hidden sm:inline ml-1">→</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    ✦ No spam. Unsubscribe anytime. ✦
                  </p>
                </form>
              )}

              {/* Trust badges mini */}
              <div className="flex flex-wrap justify-center gap-4 pt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="text-green-500">✓</span> No spam
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-green-500">✓</span> Unsubscribe anytime
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-green-500">✓</span> 10% off first order
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}