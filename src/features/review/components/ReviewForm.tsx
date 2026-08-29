"use client";

import { useState, useTransition } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { createReview } from "../actions/create-review";
import { RatingStars } from "./RatingStars";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (rating === 0) {
      setFormError("Please select a star rating");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("productId", productId);
    formData.set("rating", String(rating));

    startTransition(async () => {
      const result = await createReview(formData);
      if (!result.success) {
        setFormError(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      toast.success(result.message ?? "Review submitted");
      form.reset();
      setRating(0);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label>Your Rating</Label>
        <RatingStars value={rating} onChange={setRating} size="lg" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input id="title" name="title" placeholder="Sum up your experience" maxLength={120} />
        {fieldErrors.title?.[0] && <p className="text-xs text-destructive">{fieldErrors.title[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Review</Label>
        <Textarea
          id="comment"
          name="comment"
          rows={4}
          required
          minLength={10}
          maxLength={2000}
          placeholder="What did you like or dislike? How did it perform?"
        />
        {fieldErrors.comment?.[0] && <p className="text-xs text-destructive">{fieldErrors.comment[0]}</p>}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  );
}