export interface IBrand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  logoPublicId?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}
