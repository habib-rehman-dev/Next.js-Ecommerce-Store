// components/Header.tsx
import { currentUser } from "@clerk/nextjs/server";
import { Show, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function Header() {
  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16">
      {isAdmin && (
        <Show when="signed-in">
          <Link href="/admin" className="font-semibold">
            Admin
          </Link>
        </Show>
      )}

      <Show when="signed-in">
        <div className="border px-3 py-1 rounded-lg">
          <SignOutButton />
        </div>
      </Show>

      <Show when="signed-out">
        <Link href="/sign-in">Sign In</Link>
        <Link href="/sign-up">
          <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
            Sign Up
          </button>
        </Link>
      </Show>

      <Show when="signed-in">
        <div className="flex justify-center items-center gap-3">
          <span>{user?.firstName}</span>
          <Avatar>
            <AvatarImage src={user?.imageUrl} alt={user?.firstName ?? "User"} />
            <AvatarFallback>{user?.firstName?.[0] ?? "U"}</AvatarFallback>
          </Avatar>
        </div>
      </Show>
    </header>
  );
}
