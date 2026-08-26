import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type CloudinaryUploadResult = {
  secure_url: string;
  url: string;
  publicId: string;
};

/*
 * Uploads a buffer to Cloudinary via its upload_stream API (no temp files on
 * disk — everything stays in memory, which is fine for the image sizes we
 * accept, see lib/image-validation.ts).
 *
 * Callers are responsible for the "no orphans" rule: only call this AFTER
 * every other validation/DB precondition for the write has already passed,
 * and roll back with deleteImageFromCloudinary() if a subsequent DB write
 * fails. See features/category/actions/*.ts for the reference pattern.
 */
export async function uploadImageToCloudinary(
  buffer: Buffer,
  folder: string,
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed with no result"));
          return;
        }
        resolve({
          secure_url: result.secure_url,
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );
    uploadStream.end(buffer);
  });
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

export function getPublicIdFromUrl(url: string): string | null {
  try {
    const regex = /\/v\d+\/(.+)\.[a-z]+$/i;
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    // Fallback split logic if version prefix isn't present
    const parts = url.split("/");
    const filenameWithExt = parts.pop();
    const folder = parts.pop();
    if (!filenameWithExt) return null;
    const filename = filenameWithExt.split(".")[0];
    return folder ? `${folder}/${filename}` : filename;
  } catch {
    return null;
  }
}