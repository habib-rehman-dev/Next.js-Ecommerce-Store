import { auth } from "@clerk/nextjs/server";

import { AppError } from "@/lib/AppError";

/*
 * IMPORTANT one-time setup (Clerk Dashboard):
 * Sessions → Customize session token → add claim:
 *   { "metadata": "{{user.public_metadata}}" }
 * Without this, sessionClaims.metadata is undefined even after you set
 * publicMetadata.role on a user — the role never reaches the session token.
 *
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
  const { userId, sessionClaims } = await auth();

  // 1. Ensure user is authenticated
  if (!userId) {
    throw new AppError("Unauthenticated access", 401);
  }

  // 2. Check publicMetadata (mirrored into the session token) for admin role
  const metadata = sessionClaims?.metadata as { role?: string } | undefined;

  if (metadata?.role !== "admin") {
    throw new AppError("Admin access required", 403);
  }

  return userId;
}