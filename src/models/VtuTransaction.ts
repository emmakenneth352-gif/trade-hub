import mongoose, { Document, Schema, Types } from "mongoose";

export type VtuTransactionStatus = "success" | "pending" | "failed";

export interface IVtuTransaction extends Document {
  userId: Types.ObjectId;
  serviceId: string;
  title: string;
  subtitle: string;
  amount: number;
  status: VtuTransactionStatus;
  network?: string;
  provider?: string;
  planName?: string;
  account?: string;
  reference: string;
  requestId: string;
  orderId?: string;
  providerStatus?: string;
  providerRemark?: string;
  providerResponse?: Record<string, unknown>;
  meterToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const vtuTransactionSchema = new Schema<IVtuTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    serviceId: {
      type: String,
      required: true,
      enum: ["data", "airtime", "bills", "gotv", "giftcard", "betting", "travel"],
      index: true,
    },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "pending",
    },
    network: String,
    provider: String,
    planName: String,
    account: String,
    reference: { type: String, required: true, unique: true },
    requestId: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, index: true },
    providerStatus: String,
    providerRemark: String,
    providerResponse: { type: Schema.Types.Mixed },
    meterToken: String,
  },
  { timestamps: true }
);

export const VtuTransaction = mongoose.model<IVtuTransaction>(
  "VtuTransaction",
  vtuTransactionSchema
);
