import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITradingListing extends Document {
  slug: string;
  title: string;
  type: string;
  offer: string;
  location: string;
  sellerName: string;
  description: string;
  image: string;
  sellerId?: Types.ObjectId;
  isActive: boolean;
}

const tradingSchema = new Schema<ITradingListing>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    offer: { type: String, required: true },
    location: { type: String, default: "" },
    sellerName: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const TradingListing = mongoose.model<ITradingListing>(
  "TradingListing",
  tradingSchema
);
