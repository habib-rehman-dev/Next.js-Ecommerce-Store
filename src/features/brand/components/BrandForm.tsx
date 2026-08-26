"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ImageIcon, XIcon } from "lucide-react";

import { createBrand } from "../actions/create-brand";
import { updateBrand } from "../actions/update-brand";
import type { IBrand } from "../types";

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
  brand?: IBrand;
};

export function BrandForm({ mode, brand }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [status, setStatus] = useState<"active" | "inactive">(
    brand?.status ?? "active"
  );

  const [logoPreview, setLogoPreview] = useState<string | null>(brand?.logo ?? null);
  const [isExistingLogoRemoved, setIsExistingLogoRemoved] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Logo file size must be less than 5MB");
      e.target.value = "";
      return;
    }

    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoPreview(URL.createObjectURL(file));
    setIsExistingLogoRemoved(false); // Reset removal flag if a new file is chosen
    setFormError(null);
  }

  function clearLogo() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    setIsExistingLogoRemoved(true); // Flag existing logo for server-side deletion on save
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("status", status);
    formData.set("deleteExistingLogo", String(isExistingLogoRemoved));
    if (mode === "edit" && brand) formData.set("id", brand.id);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createBrand(formData)
          : await updateBrand(formData);

      if (!result.success) {
        setFormError(result?.message ?? null);
        setFieldErrors(
          "fieldErrors" in result
            ? (result.fieldErrors ?? {}) as Record<string, string[]>
            : {}
        );
        return;
      }

      router.push("/admin/brands");
      router.refresh();
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Brand Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {/* Hidden flag to signal backend image removal */}
          <input
            type="hidden"
            name="deleteExistingLogo"
            value={String(isExistingLogoRemoved)}
          />

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={brand?.name}
              required
              minLength={2}
              placeholder="e.g. Nike"
            />
            {fieldErrors.name?.[0] && (
              <p className="text-xs text-destructive">{fieldErrors.name[0]}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug{" "}
              <span className="font-normal text-muted-foreground">
                (optional — auto-generated if blank)
              </span>
            </Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={brand?.slug}
              placeholder="e.g. nike"
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
              defaultValue={brand?.description}
              rows={3}
              placeholder="Brief overview of this brand..."
            />
            {fieldErrors.description?.[0] && (
              <p className="text-xs text-destructive">
                {fieldErrors.description[0]}
              </p>
            )}
          </div>

          {/* Logo upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <div className="flex items-start gap-4">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30">
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Brand Logo"
                    fill
                    className="object-contain p-2"
                    unoptimized={logoPreview.startsWith("blob:")}
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Input
                  ref={fileInputRef}
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleLogoChange}
                  required={mode === "create"}
                />
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>JPEG, PNG, WEBP or GIF. Max 5MB.</span>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={clearLogo}
                      className="inline-flex items-center gap-1 text-destructive hover:underline"
                    >
                      <XIcon className="h-3 w-3" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
            {fieldErrors.logo?.[0] && (
              <p className="text-xs text-destructive">{fieldErrors.logo[0]}</p>
            )}
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as "active" | "inactive")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.status?.[0] && (
                <p className="text-xs text-destructive">
                  {fieldErrors.status[0]}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Link href="/admin/brands">
            <Button type="button" variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending
              ? "Saving…"
              : mode === "create"
              ? "Create Brand"
              : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}