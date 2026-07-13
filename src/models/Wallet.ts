import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IWallet extends Document {
  userId: Types.ObjectId;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IWalletModel extends Model<IWallet> {
  getOrCreate(userId: Types.ObjectId): Promise<IWallet>;
}

const walletSchema = new Schema<IWallet, IWalletModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "NGN" },
  },
  { timestamps: true }
);

walletSchema.statics.getOrCreate = async function getOrCreate(
  userId: Types.ObjectId
): Promise<IWallet> {
  let wallet = await this.findOne({ userId });
  if (!wallet) {
    wallet = await this.create({ userId, balance: 0 });
  }
  return wallet;
};

export const Wallet = mongoose.model<IWallet, IWalletModel>("Wallet", walletSchema);
