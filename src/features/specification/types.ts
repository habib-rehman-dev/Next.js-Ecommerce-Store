export interface ISpecificationDTO {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  values: string[];
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}