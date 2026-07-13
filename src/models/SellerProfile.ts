import mongoose, { Document, Schema } from "mongoose";

export interface ISellerProfile extends Document {
  slug: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: string;
  following: string;
  category: string;
  website?: string;
  location?: string;
  isPro: boolean;
  userId?: mongoose.Types.ObjectId;
}

const sellerProfileSchema = new Schema<ISellerProfile>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, required: true },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    followers: { type: String, default: "0" },
    following: { type: String, default: "0" },
    category: { type: String, default: "Shop" },
    website: String,
    location: String,
    isPro: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const SellerProfile = mongoose.model<ISellerProfile>(
  "SellerProfile",
  sellerProfileSchema
);
