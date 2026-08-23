"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteCategory } from "../actions/delete-category";

export function CategoryRowActions({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (!result.success) {
        setError(result.message);
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-3">
      {error && <span className="text-xs text-destructive">{error}</span>}
      <Link
        href={`/admin/categories/${id}/edit`}
        className="text-xs font-medium text-primary underline-offset-2 hover:underline"
      >
        Edit
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs font-medium text-destructive underline-offset-2 hover:underline disabled:opacity-50"
      >
        {isPending ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}