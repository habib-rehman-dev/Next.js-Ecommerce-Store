export interface IBrand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  logoPublicId?: string;
  status: "active" | "inactive";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type BrandDTO = IBrand;