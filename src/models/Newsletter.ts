import { Schema, model, models } from "mongoose";

export interface INewsletter {
  email: string;
  source?: string; // e.g., "homepage", "footer", "popup"
  isConfirmed: boolean;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    source: {
      type: String,
      enum: ["homepage", "footer", "popup", "checkout"],
      default: "homepage",
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    confirmedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for fast lookups
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ isConfirmed: 1, createdAt: -1 });

export const Newsletter =
  models.Newsletter || model<INewsletter>("Newsletter", newsletterSchema);