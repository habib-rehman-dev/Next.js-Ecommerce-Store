// src/app/components/Header.tsx
import { currentUser } from "@clerk/nextjs/server";
import { Show, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CartTrigger } from "@/features/cart/components/CartTrigger";

// Add more entries here as new storefront pages come online
// (Deals, About, etc.) — this list is the single place to wire them up.
const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Brands", href: "/brands" },
  { label: "Checkout", href: "/checkout" }
];

export default async function Header() {
  let user = null;

  try {
    user = await currentUser();
  } catch (error) {
    console.error("Clerk user lookup failed while rendering the header", error);
  }

  const isAdmin = user?.publicMetadata?.role === "admin";

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

        {/* Right side actions */}
        <div className="flex shrink-0 items-center gap-2">
          <Show when="signed-in">
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
                <AvatarImage src={user?.imageUrl} alt={user?.firstName ?? "User"} />
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
    </header>
  );
}