import mongoose, { Document, Schema } from "mongoose";

export interface ILiveSession extends Document {
  slug: string;
  sellerId: string;
  sellerName: string;
  title: string;
  viewers: number;
  avatar: string;
  thumbnail: string;
  musicId?: string;
  isLive: boolean;
  startedAt?: Date;
  endedAt?: Date;
}

const liveSessionSchema = new Schema<ILiveSession>(
  {
    slug: { type: String, required: true, unique: true },
    sellerId: { type: String, required: true, index: true },
    sellerName: { type: String, required: true },
    title: { type: String, required: true },
    viewers: { type: Number, default: 0 },
    avatar: { type: String, default: "" },
    thumbnail: { type: String, required: true },
    musicId: String,
    isLive: { type: Boolean, default: true },
    startedAt: Date,
    endedAt: Date,
  },
  { timestamps: true }
);

export const LiveSession = mongoose.model<ILiveSession>(
  "LiveSession",
  liveSessionSchema
);
