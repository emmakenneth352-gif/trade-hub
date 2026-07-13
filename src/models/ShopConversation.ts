import mongoose, { Document, Schema, Types } from "mongoose";

export interface IShopConversation extends Document {
  buyerId: Types.ObjectId;
  sellerSlug: string;
  sellerName: string;
  sellerAvatar: string;
  lastMessage: string;
  unread: number;
  createdAt: Date;
  updatedAt: Date;
}

const shopConversationSchema = new Schema<IShopConversation>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerSlug: { type: String, required: true },
    sellerName: { type: String, required: true },
    sellerAvatar: { type: String, default: "" },
    lastMessage: { type: String, default: "" },
    unread: { type: Number, default: 0 },
  },
  { timestamps: true }
);

shopConversationSchema.index({ buyerId: 1, sellerSlug: 1 }, { unique: true });

export const ShopConversation = mongoose.model<IShopConversation>(
  "ShopConversation",
  shopConversationSchema
);
