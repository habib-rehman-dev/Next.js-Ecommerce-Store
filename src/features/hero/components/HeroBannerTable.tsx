// src/features/hero/components/HeroBannerTable.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteHeroBanner } from "../actions/hero-actions";
import { HeroBannerFormDialog, BannerData } from "./HeroBannerFormDialog";

export function HeroBannerTable({ banners }: { banners: BannerData[] }) {
  const [open, setOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<BannerData | null>(null);

  const handleEdit = (banner: BannerData) => {
    setSelectedBanner(banner);
    setOpen(true);
  };

  const handleCreate = () => {
    setSelectedBanner(null);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    const res = await deleteHeroBanner(id);
    if (res.success) {
      toast.success("Banner deleted");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hero Banners</h2>
          <p className="text-sm text-muted-foreground">Manage promo banners displayed on the storefront landing page.</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Banner
        </Button>
      </div>

      <div className="border rounded-xl bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Coupon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No banners found. Create your first banner to get started.
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow key={banner._id}>
                  <TableCell>
                    <div className="relative h-12 w-20 rounded-md overflow-hidden bg-muted">
                      <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{banner.title}</div>
                    <div className="text-xs text-muted-foreground">{banner.ctaLink}</div>
                  </TableCell>
                  <TableCell>
                    {banner.couponCode ? (
                      <Badge variant="outline" className="font-mono">{banner.couponCode}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={banner.status === "active" ? "default" : "secondary"}>
                      {banner.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{banner.priority}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(banner)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(banner._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <HeroBannerFormDialog open={open} onOpenChange={setOpen} initialData={selectedBanner} />
    </div>
  );
}