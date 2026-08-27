"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ImageIcon, XIcon } from "lucide-react";

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

  const [parentCategory, setParentCategory] = useState<string>(
    category?.parentCategoryId ?? "none"
  );
  const [status, setStatus] = useState<"active" | "inactive">(
    category?.status ?? "active"
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(
    category?.isFeatured ?? false
  );

  const [imagePreview, setImagePreview] = useState<string | null>(category?.image ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setImagePreview(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("parentCategoryId", parentCategory === "none" ? "" : parentCategory);
    formData.set("status", status);
    formData.set("isFeatured", String(isFeatured));
    if (mode === "edit") formData.set("id", category!.id);

    startTransition(async () => {
      const result = mode === "create" ? await createCategory(formData) : await updateCategory(formData);

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

          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <div className="flex items-start gap-4">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized={imagePreview.startsWith("blob:")}
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Input
                  ref={fileInputRef}
                  id="image"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                />
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>JPEG, PNG, WEBP or GIF. Max 5MB.</span>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="inline-flex items-center gap-1 text-destructive hover:underline"
                    >
                      <XIcon className="h-3 w-3" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
            {fieldErrors.image?.[0] && (
              <p className="text-xs text-destructive">{fieldErrors.image[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Parent Category</Label>
            <Select
              value={parentCategory}
              onValueChange={(val) => setParentCategory(val ?? "none")}
            >
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

          <div className="grid grid-cols-3 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="isFeatured">Featured</Label>
              <div className="flex h-8 items-center gap-2">
                <input
                  id="isFeatured"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span className="text-xs text-muted-foreground">
                  Show on homepage
                </span>
              </div>
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