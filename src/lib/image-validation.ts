import "server-only";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Pulls a File out of FormData for the given key, treating an empty/unset
 * file input as "no file" rather than an empty File — browsers submit an
 * empty File (size 0) for an <input type="file"> the user never touched.
 */
export function getUploadedImageFile(formData: FormData, key = "image"): File | null {
  const value = formData.get(key);
  if (value instanceof File && value.size > 0) return value;
  return null;
}

/** Returns an error message if the file fails validation, or null if it's fine. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Image must be a JPEG, PNG, WEBP, or GIF file";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image must be smaller than 5MB";
  }
  return null;
}
