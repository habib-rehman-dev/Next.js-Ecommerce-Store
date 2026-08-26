// src/features/hero/actions/hero-actions.ts
"use server";

import { revalidatePath } from "next/cache";
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
    await dbConnect();
    const newBanner = await HeroBanner.create(data);
    revalidatePath("/admin/hero-banners");
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(newBanner)) };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create banner";
    return { success: false, error: errorMessage };
  }
}

export async function updateHeroBanner(id: string, data: Partial<HeroBannerInput>) {
  try {
    await dbConnect();
    const updatedBanner = await HeroBanner.findByIdAndUpdate(id, data, { new: true });
    revalidatePath("/admin/hero-banners");
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(updatedBanner)) };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update banner";
    return { success: false, error: errorMessage };
  }
}

export async function deleteHeroBanner(id: string) {
  try {
    await dbConnect();
    await HeroBanner.findByIdAndDelete(id);
    revalidatePath("/admin/hero-banners");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete banner";
    return { success: false, error: errorMessage };
  }
}