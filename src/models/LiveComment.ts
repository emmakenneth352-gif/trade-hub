import mongoose, { Document, Schema } from "mongoose";

export interface ILiveComment extends Document {
  liveId: mongoose.Types.ObjectId;
  user: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const liveCommentSchema = new Schema<ILiveComment>(
  {
    liveId: { type: Schema.Types.ObjectId, ref: "LiveSession", required: true },
    user: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export const LiveComment = mongoose.model<ILiveComment>(
  "LiveComment",
  liveCommentSchema
);
