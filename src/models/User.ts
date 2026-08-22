import { Schema, model, models } from "mongoose";

export interface IUser {
  clerkId: string;
  email: string;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  /*
   * Clerk's publicMetadata is the SOURCE OF TRUTH for role
   * (that's what requireAdmin() actually checks, straight off the session token).
   * This field is a mirrored copy, useful for admin dashboards that want to
   * list/filter users without calling Clerk's API.
   */
  role: "customer" | "admin";
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    // The link back to Clerk — this is how the webhook finds the right doc
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatarUrl: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

export const User = models.User || model<IUser>("User", userSchema);