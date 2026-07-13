import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISellerSubscription extends Document {
  userId: Types.ObjectId;
  plan: "monthly" | "yearly";
  amount: number;
  active: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sellerSubSchema = new Schema<ISellerSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, enum: ["monthly", "yearly"], required: true },
    amount: { type: Number, required: true },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const SellerSubscription = mongoose.model<ISellerSubscription>(
  "SellerSubscription",
  sellerSubSchema
);
