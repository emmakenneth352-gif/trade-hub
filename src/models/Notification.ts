import mongoose, { Document, Schema, Types } from "mongoose";

export type NotificationType = "like" | "match" | "chat" | "promo" | "order";

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["like", "match", "chat", "promo", "order"],
      default: "promo",
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
