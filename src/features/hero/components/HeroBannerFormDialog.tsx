// src/features/hero/components/HeroBannerFormDialog.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createHeroBanner,
  updateHeroBanner,
  HeroBannerInput,
} from "../actions/hero-actions";

export type BannerData = HeroBannerInput & { _id: string };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: BannerData | null;
}

const defaultValues: HeroBannerInput = {
  title: "",
  subtitle: "",
  ctaText: "Shop Now",
  ctaLink: "/products",
  badgeText: "",
  couponCode: "",
  imageUrl: "",
  status: "active",
  priority: 0,
};

export function HeroBannerFormDialog(props: Props) {
  const formKey = `${props.initialData?._id ?? "new"}-${props.open}`;

  return <HeroBannerFormDialogContent key={formKey} {...props} />;
}

function HeroBannerFormDialogContent({ open, onOpenChange, initialData }: Props) {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState<HeroBannerInput>(
    initialData ?? defaultValues,
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = isEditing
      ? await updateHeroBanner(initialData._id, formData)
      : await createHeroBanner(formData);

    setLoading(false);

    if (res.success) {
      toast.success(isEditing ? "Banner updated successfully" : "Banner created successfully");
      onOpenChange(false);
      setFormData(defaultValues);
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Hero Banner" : "Create Hero Banner"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Summer Sale 2026"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              name="subtitle"
              placeholder="Up to 50% off select products"
              value={formData.subtitle || ""}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaText">CTA Text</Label>
              <Input
                id="ctaText"
                name="ctaText"
                required
                value={formData.ctaText}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaLink">CTA Link</Label>
              <Input
                id="ctaLink"
                name="ctaLink"
                required
                value={formData.ctaLink}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="badgeText">Badge Text (Optional)</Label>
              <Input
                id="badgeText"
                name="badgeText"
                placeholder="Limited Time"
                value={formData.badgeText || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
              <Input
                id="couponCode"
                name="couponCode"
                placeholder="SUMMER50"
                value={formData.couponCode || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => {
                  if (val !== null) {
                    setFormData((prev) => ({ ...prev, status: val }));
                  }
                }}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                name="priority"
                type="number"
                value={formData.priority}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update Banner" : "Create Banner"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}