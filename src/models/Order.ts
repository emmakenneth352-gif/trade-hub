import mongoose, { Document, Schema, Types } from "mongoose";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface IOrder extends Document {
  buyerId: Types.ObjectId;
  productId: Types.ObjectId;
  sellerSlug?: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  total: number;
  commission: number;
  status: OrderStatus;
  shippingAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sellerSlug: String,
    productTitle: { type: String, required: true },
    productImage: { type: String, default: "" },
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
    commission: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: String,
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
