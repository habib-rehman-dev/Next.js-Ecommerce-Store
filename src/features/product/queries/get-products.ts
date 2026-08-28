import { dbConnect } from "@/lib/db/dbConnect";
import { Product } from "@/models/Product";
import "@/models/Category";
import "@/models/Brand";

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  status?: string;
  isFeatured?: boolean;
}

export async function getProducts({
  page = 1,
  limit = 10,
  search = "",
  categoryId,
  brandId,
  status,
  isFeatured,
}: GetProductsParams = {}) {
  try {
    await dbConnect();

    const query: Record<string, unknown> = {};

    // Search by product name or variant SKU
    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { "variants.sku": { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Direct match filters
    if (categoryId) query.categoryId = categoryId;
    if (brandId) query.brandId = brandId; // ✅ Already supported
    if (status) query.status = status;
    if (isFeatured !== undefined) query.isFeatured = isFeatured;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("categoryId", "name slug")
        .populate("brandId", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return {
      products: JSON.parse(JSON.stringify(products)),
      pagination: {
        total,
        pages: Math.ceil(total / limit) || 1,
        page,
        limit,
      },
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return {
      products: [],
      pagination: {
        total: 0,
        pages: 1,
        page,
        limit,
      },
    };
  }
}