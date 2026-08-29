// src/app/components/Header.tsx
import { currentUser } from "@clerk/nextjs/server";
import { Show, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CartTrigger } from "@/features/cart/components/CartTrigger";
import { HeaderSearchBox } from "@/features/product/components/HeaderSearchBox";
import { getCategories } from "@/features/category/queries/get-categories";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Package } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Brands", href: "/brands" },
];

export default async function Header() {
  let user = null;

  try {
    user = await currentUser();
  } catch (error) {
    console.error("Clerk user lookup failed while rendering the header", error);
  }

  const isAdmin = user?.publicMetadata?.role === "admin";
  const categories = (await getCategories())
    .filter((c) => c.status === "active")
    .slice(0, 8);

  return (
    <header className="sticky top-0 z-30 -mx-5 -mt-5 mb-6 rounded-t-lg border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-5">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground font-heading text-sm font-bold text-background">
            E
          </span>
          <span className="text-lg font-bold tracking-tight">Ecomora</span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}

          {categories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                Categories <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {categories.map((c) => (
                  <DropdownMenuItem key={c.id}>
                    <Link
                      href={`/products?categoryId=${c.id}`}
                      className="w-full"
                    >
                      {c.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isAdmin && (
            <Show when="signed-in">
              <Link
                href="/admin"
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Admin
              </Link>
            </Show>
          )}
        </nav>

        {/* Search (desktop) */}
        <div className="hidden md:block">
          <HeaderSearchBox />
        </div>

        {/* Right side actions */}
        <div className="flex shrink-0 items-center gap-2">
          <Show when="signed-in">
            <Link href="/orders">
              <Button variant="ghost" size="icon" aria-label="Your orders">
                <Package className="h-5 w-5" />
              </Button>
            </Link>
            <CartTrigger />
          </Show>

          <Show when="signed-out">
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/sign-in" />}
            >
              Sign In
            </Button>
            <Button
              className="rounded-full"
              nativeButton={false}
              render={<Link href="/sign-up" />}
            >
              Sign Up
            </Button>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-3">
              <Avatar size="sm">
                <AvatarImage
                  src={user?.imageUrl}
                  alt={user?.firstName ?? "User"}
                />
                <AvatarFallback>{user?.firstName?.[0] ?? "U"}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">
                {user?.firstName}
              </span>
              <div className="text-xs text-muted-foreground">
                <SignOutButton />
              </div>
            </div>
          </Show>
        </div>
      </div>

      {/* Mobile search — full width below the main bar */}
      <div className="border-t px-5 py-2 md:hidden">
        <HeaderSearchBox />
      </div>
    </header>
  );
}
