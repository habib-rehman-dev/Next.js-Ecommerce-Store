export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategoryId: string | null;
  status: "active" | "inactive";
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};