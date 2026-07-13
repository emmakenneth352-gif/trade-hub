import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUserPost extends Document {
  userId: Types.ObjectId;
  title: string;
  price: string;
  image: string;
  category: string;
  caption?: string;
  music?: Record<string, unknown>;
  likes: number;
  isVideo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userPostSchema = new Schema<IUserPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, default: "General" },
    caption: String,
    music: { type: Schema.Types.Mixed },
    likes: { type: Number, default: 0 },
    isVideo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserPost = mongoose.model<IUserPost>("UserPost", userPostSchema);
