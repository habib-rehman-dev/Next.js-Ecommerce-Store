// src/app/admin/products/featured/page.tsx
import { getProducts } from "@/features/product/queries/get-products";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, StarOff } from "lucide-react";
import { toggleProductFeaturedForm } from "@/features/product/actions/toggle-featured";

export default async function FeaturedProductsPage() {
  const { products } = await getProducts({ limit: 100 });
 
  const featuredProducts = products.filter((p : { isFeatured: boolean }) => p.isFeatured);
  const nonFeaturedProducts = products.filter((p : { isFeatured: boolean }) => !p.isFeatured);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Featured Products</h1>
        <p className="text-sm text-muted-foreground">
          Manage which products appear on the homepage
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured Products */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-primary/10 p-3 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              Featured Products ({featuredProducts.length})
            </h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {featuredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    No featured products yet
                  </TableCell>
                </TableRow>
              ) : (
                featuredProducts.map((product: { _id: string; name: string }) => (
                  <TableRow key={product._id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right">
                      <form action={toggleProductFeaturedForm}>
                        <input type="hidden" name="productId" value={product._id} />
                        <input type="hidden" name="featured" value="false" />
                        <Button variant="ghost" size="sm" type="submit">
                          <StarOff className="h-4 w-4" />
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Non-Featured Products */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/30 p-3 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <StarOff className="h-4 w-4 text-muted-foreground" />
              Available Products ({nonFeaturedProducts.length})
            </h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nonFeaturedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    All products are featured
                  </TableCell>
                </TableRow>
              ) : (
                nonFeaturedProducts.map((product: { _id: string; name: string }) => (
                  <TableRow key={product._id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right">
                      <form action={toggleProductFeaturedForm}>
                        <input type="hidden" name="productId" value={product._id} />
                        <input type="hidden" name="featured" value="true" />
                        <Button variant="outline" size="sm" type="submit">
                          <Star className="h-4 w-4" />
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}