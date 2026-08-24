import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";








export default async function NewCategoryPage() {
    return <>
     <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/brands">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Brand</h1>
          <p className="text-sm text-muted-foreground">
            Add a new product Brand to your store catalog.
          </p>
        </div>
      </div>

      {/* <CategoryForm mode="create" parentOptions={parentOptions} /> */}
    </div>
    
    </>
}