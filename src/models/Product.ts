import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProduct extends Document {
  sellerId?: Types.ObjectId;
  slug: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  sold?: string;
  category: string;
  sellerName: string;
  sellerAvatar: string;
  image: string;
  images: string[];
  isFlashDeal: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    oldPrice: Number,
    discount: Number,
    sold: String,
    category: { type: String, required: true, index: true },
    sellerName: { type: String, required: true },
    sellerAvatar: { type: String, default: "" },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    isFlashDeal: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text", category: "text" });

export const Product = mongoose.model<IProduct>("Product", productSchema);
