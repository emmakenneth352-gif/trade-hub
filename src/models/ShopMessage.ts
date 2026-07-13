import mongoose, { Document, Schema, Types } from "mongoose";

export interface IShopMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  isSeller: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const shopMessageSchema = new Schema<IShopMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "ShopConversation",
      required: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    isSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ShopMessage = mongoose.model<IShopMessage>(
  "ShopMessage",
  shopMessageSchema
);
