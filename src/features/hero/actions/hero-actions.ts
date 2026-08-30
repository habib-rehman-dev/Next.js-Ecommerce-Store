"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { dbConnect } from "@/lib/db/dbConnect";
import { HeroBanner } from "@/models/HeroBanner";

export interface HeroBannerInput {
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
  badgeText?: string;
  couponCode?: string;
  imageUrl: string;
  status: "active" | "draft";
  priority: number;
}

export async function createHeroBanner(data: HeroBannerInput) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Admin access required" };
  }

  try {
    await dbConnect();
    const newBanner = await HeroBanner.create(data);
    revalidatePath("/admin/hero-banners");
    revalidatePath("/");
    revalidateTag("hero-banners", "max");
    return { success: true, data: JSON.parse(JSON.stringify(newBanner)) };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create banner";
    return { success: false, error: errorMessage };
  }
}

export async function updateHeroBanner(id: string, data: Partial<HeroBannerInput>) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Admin access required" };
  }

  if (!id) {
    return { success: false, error: "Banner id is required" };
  }

  try {
    await dbConnect();
    const updatedBanner = await HeroBanner.findByIdAndUpdate(id, data, { new: true });
    if (!updatedBanner) {
      return { success: false, error: "Banner not found" };
    }
    revalidatePath("/admin/hero-banners");
    revalidatePath("/");
    revalidateTag("hero-banners", "max");
    return { success: true, data: JSON.parse(JSON.stringify(updatedBanner)) };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update banner";
    return { success: false, error: errorMessage };
  }
}

export async function deleteHeroBanner(id: string) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Admin access required" };
  }

  if (!id) {
    return { success: false, error: "Banner id is required" };
  }

  try {
    await dbConnect();
    const deleted = await HeroBanner.findByIdAndDelete(id);
    if (!deleted) {
      return { success: false, error: "Banner not found" };
    }
    revalidatePath("/admin/hero-banners");
    revalidatePath("/");
    revalidateTag("hero-banners", "max");
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete banner";
    return { success: false, error: errorMessage };
  }
}