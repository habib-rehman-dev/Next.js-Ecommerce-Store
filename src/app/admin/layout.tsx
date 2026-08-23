import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AppError } from "@/lib/AppError";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AppError) {
      redirect("/");
    }
    throw err;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-border bg-muted/30 p-4">
        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/admin" className="rounded-md px-3 py-2 hover:bg-muted">Dashboard</Link>
          <Link href="/admin/categories" className="rounded-md px-3 py-2 hover:bg-muted">Categories</Link>
          <Link href="/admin/brands" className="rounded-md px-3 py-2 hover:bg-muted">Brands</Link>
          <Link href="/admin/products" className="rounded-md px-3 py-2 hover:bg-muted">Products</Link>
          <Link href="/admin/coupons" className="rounded-md px-3 py-2 hover:bg-muted">Coupons</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}