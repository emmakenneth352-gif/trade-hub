import mongoose, { Document, Schema } from "mongoose";

export interface IReel extends Document {
  slug: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  title: string;
  caption: string;
  views: string;
  likes: number;
  commentsCount: number;
  duration: string;
  thumbnail: string;
  videoUrl?: string;
  productId?: string;
  musicId?: string;
  isActive: boolean;
}

const reelSchema = new Schema<IReel>(
  {
    slug: { type: String, required: true, unique: true },
    sellerId: { type: String, required: true, index: true },
    sellerName: { type: String, required: true },
    sellerAvatar: { type: String, default: "" },
    title: { type: String, required: true },
    caption: { type: String, default: "" },
    views: { type: String, default: "0" },
    likes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    duration: { type: String, default: "0:30" },
    thumbnail: { type: String, required: true },
    videoUrl: String,
    productId: String,
    musicId: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Reel = mongoose.model<IReel>("Reel", reelSchema);
