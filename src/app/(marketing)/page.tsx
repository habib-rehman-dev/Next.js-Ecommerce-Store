import {
  Alert,
  // AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";

import { InfoIcon } from "lucide-react";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentUser();
  const hasVisitedAdminRoute = Boolean(
    user?.publicMetadata?.hasVisitedAdminRoute
  );

  if (user?.publicMetadata?.role === "admin" && !hasVisitedAdminRoute) {
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: {
          hasVisitedAdminRoute: true,
        },
      });
    } catch {
      // If metadata update fails, still send the user to admin.
    }

    redirect("/admin");
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Alert className="w-2/3">
        <InfoIcon />
        <AlertTitle>New feature available</AlertTitle>
        <AlertDescription>
          We&apos;ve added dark mode support. You can enable it in your account
          settings.
        </AlertDescription>
      </Alert>
    </div>
  );
}
