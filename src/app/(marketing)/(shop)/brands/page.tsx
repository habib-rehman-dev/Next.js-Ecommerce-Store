// // src/app/brands/page.tsx
// import { getActiveBrands } from "@/features/brand/queries/get-active-brands";
// import { BrandGrid } from "@/features/brand/components/BrandGrid";
// import { Button } from "@/components/ui/button";
// import { ArrowLeft, Search } from "lucide-react";
// import Link from "next/link";
// import { Input } from "@/components/ui/input";

// export default async function BrandsPage() {
//   const brands = await getActiveBrands(100); // Get all active brands

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header Section */}
//       <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <Link href="/">
//                 <Button variant="ghost" size="icon" className="h-9 w-9">
//                   <ArrowLeft className="h-4 w-4" />
//                 </Button>
//               </Link>
//               <div>
//                 <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
//                   All Brands
//                 </h1>
//                 <p className="text-sm text-muted-foreground hidden sm:block">
//                   Discover products from {brands.length} brands
//                 </p>
//               </div>
//             </div>
            
//             {/* Search - Will work with client component */}
//             <div className="w-full sm:w-auto">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search brands..."
//                   className="pl-9 w-full sm:w-64"
//                   // We'll add search functionality later
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Brand Grid */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
//         <BrandGrid brands={brands} />
//       </div>
//     </div>
//   );



// }





// src/app/brands/page.tsx (with search)
import { getActiveBrands } from "@/features/brand/queries/get-active-brands";
import { BrandGrid } from "@/features/brand/components/BrandGrid";
import { BrandSearch } from "@/features/brand/components/BrandSearch";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function BrandsPage() {
  const brands = await getActiveBrands(100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Search */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  All Brands
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Discover products from {brands.length} brands
                </p>
              </div>
            </div>
            
            <BrandSearch brands={brands} />
          </div>
        </div>
      </div>

      {/* Brand Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <BrandGrid brands={brands} />
      </div>
    </div>
  );
}