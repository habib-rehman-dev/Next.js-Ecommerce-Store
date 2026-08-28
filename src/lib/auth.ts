import { auth, currentUser } from "@clerk/nextjs/server";

import { AppError } from "@/lib/AppError";

/*
 * These replace your old Express `requireAuth`/`requireAdmin` middleware.
 * Same checks, same messages, same status codes carried into AppError —
 * but called as the first line inside a Server Action/Route Handler instead
 * of sitting in a router chain.
 */

export async function requireAuth(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new AppError("Unauthenticated access", 401);
  }

  return userId;
}

export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();

  // 1. Ensure user is authenticated
  if (!userId) {
    throw new AppError("Unauthenticated access", 401);
  }

  // Read the authoritative user metadata instead of relying on a custom token claim.
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "admin") {
    throw new AppError("Admin access required", 403);
  }

  return userId;
}