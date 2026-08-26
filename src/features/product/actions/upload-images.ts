"use server";

import { requireAdmin } from "@/lib/auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

const CLOUDINARY_FOLDER = "commerce-store/products";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type UploadedImage = {
  url: string;
  publicId: string;
};

function parseDataUrl(dataUrl: string): { mimeType: string; buffer: Buffer } {
  const match = /^data:(.+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error("Invalid image data");
  }
  const [, mimeType, base64Data] = match;
  return { mimeType, buffer: Buffer.from(base64Data, "base64") };
}

export async function uploadImagesToCloudinary(
  base64Files: string[]
): Promise<UploadedImage[]> {
  await requireAdmin();

  const uploads = await Promise.all(
    base64Files.map(async (dataUrl) => {
      const { mimeType, buffer } = parseDataUrl(dataUrl);

      if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
        throw new Error(`Unsupported image type: ${mimeType}`);
      }
      if (buffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
        throw new Error("Image must be smaller than 5MB");
      }

      const result = await uploadImageToCloudinary(buffer, CLOUDINARY_FOLDER);
      return { url: result.url, publicId: result.publicId };
    })
  );

  return uploads;
}