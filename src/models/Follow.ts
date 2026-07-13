import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFollow extends Document {
  followerId: Types.ObjectId;
  sellerSlug: string;
}

const followSchema = new Schema<IFollow>(
  {
    followerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerSlug: { type: String, required: true },
  },
  { timestamps: true }
);

followSchema.index({ followerId: 1, sellerSlug: 1 }, { unique: true });

export const Follow = mongoose.model<IFollow>("Follow", followSchema);
