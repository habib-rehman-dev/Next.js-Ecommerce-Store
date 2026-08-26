"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { deleteBrand } from "../actions/delete-brand";

import { Button } from "@/components/ui/button";

export function BrandRowActions({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteBrand(id);
      if (!result.success) {
        setError(result.message);
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-destructive">{error}</span>}
      <Button nativeButton={false} render={<Link href={`/admin/brands/${id}/edit`} />}>
        Edit
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
      >
        {isPending ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}
