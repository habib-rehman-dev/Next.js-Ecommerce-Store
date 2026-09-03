// src/features/product/components/ProductForm.tsx
// Add this section in the form where you have status and other fields

"use client";

import { getSuggestedSpecsAction } from "@/features/specification/actions/get-suggested-specs";
import type { SuggestedSpec } from "@/features/specification/queries/get-specifications-by-category";
import { useState, useTransition, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Upload,
  X,
  Layers,
  Star,
} from "lucide-react";

import { createProduct } from "../actions/create-product";
import { updateProduct } from "../actions/update-product";
import type { IProduct } from "../types";

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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { uploadImagesToCloudinary } from "../actions/upload-images";

type CategoryOrBrandOption = {
  _id: string;
  name: string;
};

type Props = {
  mode: "create" | "edit";
  product?: IProduct;
  categories: CategoryOrBrandOption[];
  brands: CategoryOrBrandOption[];
};

type FormVariant = {
  _id?: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stock: number;
  attributes: { key: string; value: string }[];
};

export function ProductForm({ mode, product, categories, brands }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Category and Brand selects
  const [categoryId, setCategoryId] = useState<string>(
    typeof product?.categoryId === "object"
      ? String(product.categoryId._id)
      : String(product?.categoryId || ""),
  );
  const [brandId, setBrandId] = useState<string>(
    typeof product?.brandId === "object"
      ? String(product.brandId._id)
      : String(product?.brandId || ""),
  );
  const [status, setStatus] = useState<"active" | "inactive">(
    product?.status ?? "active",
  );

  const [suggestedSpecs, setSuggestedSpecs] = useState<SuggestedSpec[]>([]);

  useEffect(() => {
    if (!categoryId) {
      setSuggestedSpecs([]);
      return;
    }
    let cancelled = false;
    getSuggestedSpecsAction(categoryId).then((specs) => {
      if (!cancelled) setSuggestedSpecs(specs);
    });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  // NEW: Add isFeatured state
  const [isFeatured, setIsFeatured] = useState<boolean>(
    product?.isFeatured ?? false,
  );

  // 1. Existing Cloudinary Images & Public IDs State
  const [existingImages, setExistingImages] = useState<string[]>(
    product?.images || [],
  );
  const [existingPublicIds, setExistingPublicIds] = useState<string[]>(
    product?.imagePublicIds || [],
  );

  // 2. New File Upload Previews
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3. Dynamic Variants State
  const [variants, setVariants] = useState<FormVariant[]>(() => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants.map((v) => ({
        _id: v._id,
        sku: v.sku,
        price: v.price,
        discountPrice: v.discountPrice,
        stock: v.stock,
        attributes: v.attributes
          ? Object.entries(v.attributes).map(([key, value]) => ({ key, value }))
          : [],
      }));
    }
    return [
      {
        sku: "",
        price: 0,
        stock: 0,
        attributes: [{ key: "color", value: "Black" }],
      },
    ];
  });

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  // Handle New File Selection
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Validate size (< 5MB each)
    const validFiles = files.filter((f) => f.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) {
      setFormError("Some images exceeded the 5MB file limit and were skipped.");
    }

    const updatedFiles = [...newFiles, ...validFiles];
    setNewFiles(updatedFiles);

    const updatedPreviews = [
      ...newFilePreviews,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ];
    setNewFilePreviews(updatedPreviews);
  }

  // Remove individual Existing Image
  function removeExistingImage(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setExistingPublicIds((prev) => prev.filter((_, i) => i !== index));
  }

  // Remove individual New Unsaved File
  function removeNewFile(index: number) {
    URL.revokeObjectURL(newFilePreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewFilePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  // Variant Helpers
  function addVariant() {
    setVariants((prev) => [
      ...prev,
      {
        sku: "",
        price: 0,
        stock: 0,
        attributes: [{ key: "", value: "" }],
      },
    ]);
  }

  function removeVariant(index: number) {
    if (variants.length <= 1) {
      setFormError("At least one variant is required.");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariantField(
    index: number,
    field: keyof FormVariant,
    val: unknown,
  ) {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  }

  function addAttribute(variantIndex: number) {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex].attributes.push({ key: "", value: "" });
      return updated;
    });
  }

  function removeAttribute(variantIndex: number, attrIndex: number) {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex].attributes = updated[
        variantIndex
      ].attributes.filter((_, i) => i !== attrIndex);
      return updated;
    });
  }

  function updateAttribute(
    variantIndex: number,
    attrIndex: number,
    keyOrValue: "key" | "value",
    val: string,
  ) {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex].attributes[attrIndex][keyOrValue] = val;
      return updated;
    });
  }

  // Submit Handler
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!categoryId) return setFormError("Please select a category.");
    if (!brandId) return setFormError("Please select a brand.");

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const finalImages = [...existingImages];
        const finalPublicIds = [...existingPublicIds];

        // Upload new selected files if any exist
        if (newFiles.length > 0) {
          const base64Files = await Promise.all(newFiles.map(fileToBase64));
          const uploaded = await uploadImagesToCloudinary(base64Files);

          uploaded.forEach((img) => {
            finalImages.push(img.url);
            finalPublicIds.push(img.publicId);
          });
        }

        // Format Variants
        const formattedVariants = variants.map((v) => {
          const attributesRecord: Record<string, string> = {};
          v.attributes.forEach((attr) => {
            if (attr.key.trim() && attr.value.trim()) {
              attributesRecord[attr.key.trim().toLowerCase()] =
                attr.value.trim();
            }
          });

          return {
            _id: v._id,
            sku: v.sku.trim().toUpperCase(),
            price: Number(v.price),
            discountPrice: v.discountPrice
              ? Number(v.discountPrice)
              : undefined,
            stock: Number(v.stock),
            attributes: attributesRecord,
          };
        });

        // Construct Payload with populated Cloudinary array data
        const payload = {
          name: formData.get("name") as string,
          slug: formData.get("slug") as string,
          description: formData.get("description") as string,
          categoryId,
          brandId,
          status,
          isFeatured, // NEW: Include isFeatured in payload
          images: finalImages,
          imagePublicIds: finalPublicIds,
          variants: formattedVariants,
        };

        const action =
          mode === "create"
            ? createProduct(payload)
            : updateProduct(product!._id, payload);

        const result = await action;

        if (!result.success) {
          setFormError(result.message);
          setFieldErrors(result.fieldErrors || {});
          return;
        }

        router.push("/admin/products");
        router.refresh();
      } catch (err: unknown) {
        setFormError(
          err instanceof Error
            ? err.message
            : "Failed to process image uploads.",
        );
      }
    });
  }
  // Pick the variant with the best (lowest) effective price, considering discount
  // const bestVariant = product.variants.reduce((best, v) => {
  //   const bestEffective = best.discountPrice ?? best.price;
  //   const vEffective = v.discountPrice ?? v.price;
  //   return vEffective < bestEffective ? v : best;
  // }, product.variants[0]);

  // const effectivePrice = bestVariant.discountPrice ?? bestVariant.price;
  // const hasDiscount =
  //   bestVariant.discountPrice != null &&
  //   bestVariant.discountPrice < bestVariant.price;

  return (
    <Card className="max-w-5xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Add Product" : "Edit Product"}
          </CardTitle>
          <CardDescription>
            Manage basic details, image gallery, and inventory variants.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name}
                required
                placeholder="e.g. Mechanical Gaming Keyboard"
              />
              {fieldErrors.name?.[0] && (
                <p className="text-xs text-destructive">
                  {fieldErrors.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug{" "}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={product?.slug}
                placeholder="auto-generated-if-blank"
              />
              {fieldErrors.slug?.[0] && (
                <p className="text-xs text-destructive">
                  {fieldErrors.slug[0]}
                </p>
              )}
            </div>
          </div>

          {/* Category, Brand, Status, and Featured */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={categoryId}
                onValueChange={(value) => {
                  if (value !== null) setCategoryId(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Brand *</Label>
              <Select
                value={brandId}
                onValueChange={(value) => {
                  if (value !== null) setBrandId(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b._id} value={b._id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as "active" | "inactive")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* NEW: Featured Toggle */}
            <div className="space-y-2">
              <Label>Featured Product</Label>
              <div className="flex h-8 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${isFeatured ? "bg-primary" : "bg-muted"}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${isFeatured ? "translate-x-6" : "translate-x-1"}
                    `}
                  />
                </button>
                <div className="flex items-center gap-2">
                  <Star
                    className={`
                    h-4 w-4 transition-colors
                    ${isFeatured ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
                  `}
                  />
                  <span className="text-xs text-muted-foreground">
                    {isFeatured ? "Featured" : "Not Featured"}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Featured products appear on the homepage
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description}
              rows={4}
              placeholder="Detailed product features..."
            />
          </div>

          {/* Product Gallery Section */}
          <div className="space-y-3 pt-4 border-t">
            <div>
              <Label className="text-base font-semibold">Product Gallery</Label>
              <p className="text-xs text-muted-foreground">
                Upload image assets or manage existing Cloudinary images.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {/* Existing Images */}
              {existingImages.map((src, index) => (
                <div
                  key={src}
                  className="relative aspect-square rounded-md border overflow-hidden bg-muted group"
                >
                  <Image
                    src={src}
                    alt="Gallery item"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 bg-destructive/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* New Selected Files Previews */}
              {newFilePreviews.map((src, index) => (
                <div
                  key={src}
                  className="relative aspect-square rounded-md border border-dashed border-primary overflow-hidden bg-muted group"
                >
                  <Image
                    src={src}
                    alt="New upload"
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute bottom-1 left-1 text-[9px] px-1 py-0">
                    New
                  </Badge>
                  <button
                    type="button"
                    onClick={() => removeNewFile(index)}
                    className="absolute top-1 right-1 bg-destructive/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Upload Trigger Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-md text-muted-foreground hover:border-primary hover:text-primary transition-colors bg-card"
              >
                <Upload className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Add Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
          </div>

          {/* Variants Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4" /> Product Variants *
                </Label>
                <p className="text-xs text-muted-foreground">
                  Define SKUs, prices, stock levels, and custom attributes.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Variant
              </Button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, vIdx) => (
                <div
                  key={variant._id || vIdx}
                  className="p-4 border rounded-lg bg-card space-y-4 relative"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Variant #{vIdx + 1}
                    </span>
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-destructive hover:text-destructive"
                        onClick={() => removeVariant(vIdx)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs">SKU *</Label>
                      <Input
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariantField(vIdx, "sku", e.target.value)
                        }
                        placeholder="e.g. KBD-BLK-01"
                        className="font-mono text-xs uppercase"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Price ($) *</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariantField(vIdx, "price", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-xs">
                        Sale Price ($){" "}
                        <span className="text-muted-foreground">
                          — final price, must be lower than regular price
                        </span>
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={variant.discountPrice || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateVariantField(vIdx, "discountPrice", val);
                        }}
                        placeholder="Leave blank if no sale"
                      />
                      {variant.discountPrice !== undefined &&
                        variant.discountPrice !== null &&
                        Number(variant.discountPrice) > 0 &&
                        Number(variant.discountPrice) >=
                          Number(variant.price) && (
                          <p className="text-xs text-destructive mt-1">
                            Sale price must be lower than the regular price ($
                            {variant.price || 0})
                          </p>
                        )}
                    </div>

                    <div>
                      <Label className="text-xs">Stock Quantity *</Label>
                      <Input
                        type="number"
                        min={0}
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariantField(vIdx, "stock", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Attributes (e.g., Color, Size) */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">
                        Custom Attributes (e.g., Color, Size, RAM)
                      </Label>
                      <button
                        type="button"
                        onClick={() => addAttribute(vIdx)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        + Add Attribute
                      </button>
                    </div>

                    <div className="space-y-2">
                      {variant.attributes.map((attr, aIdx) => (
                        <div key={aIdx} className="flex items-center gap-2">
                          <Input
                            placeholder="Key (e.g. color)"
                            value={attr.key}
                            onChange={(e) =>
                              updateAttribute(vIdx, aIdx, "key", e.target.value)
                            }
                            className="h-8 text-xs"
                          />
                          <Input
                            placeholder="Value (e.g. Red)"
                            value={attr.value}
                            onChange={(e) =>
                              updateAttribute(
                                vIdx,
                                aIdx,
                                "value",
                                e.target.value,
                              )
                            }
                            className="h-8 text-xs"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => removeAttribute(vIdx, aIdx)}
                          >
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {suggestedSpecs.length > 0 && (
                      <div className="space-y-1.5 rounded-md border border-dashed p-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Suggested for this category
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestedSpecs.map((spec) =>
                            spec.values.map((value) => (
                              <button
                                key={`${spec.name}-${value}`}
                                type="button"
                                onClick={() => {
                                  setVariants((prev) => {
                                    const updated = [...prev];
                                    updated[vIdx].attributes.push({
                                      key: spec.name.toLowerCase(),
                                      value,
                                    });
                                    return updated;
                                  });
                                }}
                                className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary hover:text-primary"
                              >
                                {spec.name}: {value}
                              </button>
                            )),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Link href="/admin/products">
            <Button type="button" variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending
              ? "Saving..."
              : mode === "create"
                ? "Create Product"
                : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
