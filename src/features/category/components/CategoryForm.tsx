"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

import { createCategory } from "../actions/create-category";
import { updateCategory } from "../actions/update-category";
import type { CategoryDTO } from "../types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  // Controlled states for shadcn Select components
  const [parentCategory, setParentCategory] = useState<string>(
    category?.parentCategoryId ?? "none"
  );
  const [status, setStatus] = useState<"active" | "inactive">(
    category?.status ?? "active"
  );

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
      parentCategoryId: parentCategory === "none" ? null : parentCategory,
      status,
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
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={category?.name}
              required
              minLength={2}
              placeholder="e.g. Footwear"
            />
            {fieldErrors.name?.[0] && (
              <p className="text-xs text-destructive">{fieldErrors.name[0]}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-muted-foreground font-normal">(optional — auto-generated if blank)</span>
            </Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={category?.slug}
              placeholder="e.g. footwear"
            />
            {fieldErrors.slug?.[0] && (
              <p className="text-xs text-destructive">{fieldErrors.slug[0]}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={category?.description}
              rows={3}
              placeholder="Brief summary of this category..."
            />
            {fieldErrors.description?.[0] && (
              <p className="text-xs text-destructive">{fieldErrors.description[0]}</p>
            )}
          </div>

          {/* Image URL Placeholder */}
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              name="image"
              defaultValue={category?.image}
              placeholder="https://example.com/image.jpg"
            />
            {fieldErrors.image?.[0] && (
              <p className="text-xs text-destructive">{fieldErrors.image[0]}</p>
            )}
          </div>

          {/* Parent Category */}
          <div className="space-y-2">
            <Label>Parent Category</Label>
            <Select value={parentCategory} onValueChange={setParentCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Top-level category)</SelectItem>
                {parentOptions
                  .filter((p) => p.id !== category?.id)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {fieldErrors.parentCategoryId?.[0] && (
              <p className="text-xs text-destructive">{fieldErrors.parentCategoryId[0]}</p>
            )}
          </div>

          {/* Status & Sort Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as "active" | "inactive")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.status?.[0] && (
                <p className="text-xs text-destructive">{fieldErrors.status[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={category?.sortOrder ?? 0}
              />
              {fieldErrors.sortOrder?.[0] && (
                <p className="text-xs text-destructive">{fieldErrors.sortOrder[0]}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/categories")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Saving…" : mode === "create" ? "Create Category" : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}