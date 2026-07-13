import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReelComment extends Document {
  reelId: Types.ObjectId;
  userId?: Types.ObjectId;
  user: string;
  avatar: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const reelCommentSchema = new Schema<IReelComment>(
  {
    reelId: { type: Schema.Types.ObjectId, ref: "Reel", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    user: { type: String, required: true },
    avatar: { type: String, default: "" },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export const ReelComment = mongoose.model<IReelComment>(
  "ReelComment",
  reelCommentSchema
);
