export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // any non-alphanumeric run -> single hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}