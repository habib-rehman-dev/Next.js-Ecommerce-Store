"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "../actions/create-category";
import { updateCategory } from "../actions/update-category";
import type { CategoryDTO } from "../types";

type Props = {
  mode: "create" | "edit";
  category?: CategoryDTO;
  parentOptions: CategoryDTO[];
};

export function CategoryForm({ mode, category, parentOptions }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      slug: String(form.get("slug") ?? ""),
      description: String(form.get("description") ?? ""),
      image: String(form.get("image") ?? ""),
      parentCategoryId: (form.get("parentCategoryId") as string) || null,
      status: form.get("status") as "active" | "inactive",
      sortOrder: Number(form.get("sortOrder") ?? 0),
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCategory(payload)
          : await updateCategory({ id: category!.id, ...payload });

      if (!result.success) {
        setFormError(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      router.push("/admin/categories");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      {formError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}

      <Field label="Name" error={fieldErrors.name?.[0]}>
        <input name="name" defaultValue={category?.name} required minLength={2} className="input" />
      </Field>

      <Field label="Slug (optional — auto-generated from name if left blank)" error={fieldErrors.slug?.[0]}>
        <input name="slug" defaultValue={category?.slug} className="input" />
      </Field>

      <Field label="Description" error={fieldErrors.description?.[0]}>
        <textarea name="description" defaultValue={category?.description} rows={3} className="input" />
      </Field>

      <Field label="Image URL" error={fieldErrors.image?.[0]}>
        <input name="image" defaultValue={category?.image} className="input" />
      </Field>

      <Field label="Parent category" error={fieldErrors.parentCategoryId?.[0]}>
        <select name="parentCategoryId" defaultValue={category?.parentCategoryId ?? ""} className="input">
          <option value="">None (top-level)</option>
          {parentOptions
            .filter((p) => p.id !== category?.id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
      </Field>

      <div className="flex gap-4">
        <Field label="Status" error={fieldErrors.status?.[0]}>
          <select name="status" defaultValue={category?.status ?? "active"} className="input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>

        <Field label="Sort order" error={fieldErrors.sortOrder?.[0]}>
          <input name="sortOrder" type="number" min={0} defaultValue={category?.sortOrder ?? 0} className="input" />
        </Field>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 h-9 w-fit rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
      >
        {isPending ? "Saving…" : mode === "create" ? "Create category" : "Save changes"}
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-1 flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}