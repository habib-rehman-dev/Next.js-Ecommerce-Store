import mongoose from "mongoose";
import { env } from "@/lib/env";

/*
 * Why globalThis caching (not a plain module-level flag) is required here:
 *
 * Your old Express `connectDB()` used a simple `let isConnected` flag, which
 * is correct for Vercel serverless — a warm function reuses the same loaded
 * module, so the flag survives between requests.
 *
 * Next.js DEV mode breaks that assumption: Fast Refresh re-evaluates modules
 * on every file save, which resets a plain module-level variable. That would
 * silently open a brand new MongoDB connection on every hot reload and
 * eventually exhaust the connection pool.
 *
 * globalThis survives module re-evaluation (both in dev HMR and in warm
 * serverless invocations), so we cache the connection PROMISE there instead
 * of a boolean — caching the promise (not just a flag) also means concurrent
 * calls to dbConnect() during startup all await the same in-flight connection
 * instead of racing to call mongoose.connect() twice.
 */

declare global {
  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

export async function dbConnect(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!global._mongooseConn) {
    if (env.NODE_ENV !== "production") {
      console.log("MongoDB connecting...");
    }

    global._mongooseConn = mongoose.connect(env.MONGODB_URI, {
      dbName: "e-commerce_store",
    });
  }

  await global._mongooseConn;
  return mongoose;
}