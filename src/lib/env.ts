const requiredEnvVars = [
  "MONGODB_URI",
  // "CLERK_WEBHOOK_SECRET",
  // "STRIPE_SECRET_KEY",
  // "STRIPE_WEBHOOK_SECRET",
] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  MONGODB_URI: process.env.MONGODB_URI as string,
  CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET as string,
  // STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
  // STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
};