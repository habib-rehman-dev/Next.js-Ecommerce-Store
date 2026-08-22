import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const user = await currentUser();

  if (user?.publicMetadata?.role !== "admin") {
    redirect("/");
  }

  return <div>Dashboard</div>;
}
