import crypto from "crypto";
import mongoose, { Document, Model, Schema } from "mongoose";
import validator from "validator";
import { AppError } from "../utils/AppError";

export type VerificationCode = {
  code: number;
  expiry: Date;
  kind: "email" | "phone" | "reset";
};

export type UserRole = "admin" | "super-admin" | "user";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  premium: boolean;
  email?: string;
  phone?: string;
  photo: string;
  location?: {
    type: "Point";
    coordinates?: [number, number];
  };
  verificationCode?: VerificationCode;
  isBlocked: boolean;
  referalCode?: string;
  createdAt: Date;
  updatedAt: Date;
  createVerificationCode(type: VerificationCode["kind"]): Promise<number>;
  verifyCode(code: number): boolean;
}

interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByPhone(phone: string): Promise<IUser | null>;
}

const generateOtp = (): number => {
  const randomBytes = crypto.randomBytes(4);
  const randomNum = randomBytes.readUInt32BE(0);
  return 100000 + (randomNum % 900000);
};

const userSchema = new Schema<IUser, IUserModel>(
  {
    firstName: { type: String, trim: true, maxlength: 50 },
    lastName: { type: String, trim: true, maxlength: 50 },
    role: {
      type: String,
      enum: ["admin", "super-admin", "user"],
      default: "user",
    },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    premium: { type: Boolean, default: false },
    referalCode: { type: String, sparse: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      validate: {
        validator: (v: string) => !v || validator.isEmail(v),
        message: "Please provide a valid email",
      },
    },
    phone: {
      type: String,
      sparse: true,
      validate: {
        validator: (v: string) => !v || validator.isMobilePhone(v, "any"),
        message: "Please provide a valid phone number",
      },
    },
    photo: { type: String, default: "" },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: (coords: number[]) => !coords || coords.length === 2,
          message: "Location must have exactly 2 coordinates",
        },
      },
    },
    isBlocked: { type: Boolean, default: false },
    verificationCode: {
      type: {
        code: Number,
        expiry: Date,
        kind: String,
      },
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const record = ret as Record<string, unknown>;
        delete record.__v;
        delete record.verificationCode;
        return ret;
      },
    },
  }
);

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ referalCode: 1 }, { unique: true, sparse: true });
userSchema.index({ location: "2dsphere" });

userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email }).select("+verificationCode");
};

userSchema.statics.findByPhone = function (phone: string) {
  return this.findOne({ phone }).select("+verificationCode");
};

userSchema.methods.createVerificationCode = async function (
  kind: VerificationCode["kind"]
): Promise<number> {
  const code = generateOtp();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);
  this.verificationCode = { code, expiry, kind };
  await this.save({ validateBeforeSave: false });
  return code;
};

userSchema.methods.verifyCode = function (code: number): boolean {
  if (!this.verificationCode) {
    throw new AppError("No verification code found", 400);
  }
  if (this.verificationCode.code !== code) {
    throw new AppError("Invalid verification code", 400);
  }
  if (this.verificationCode.expiry < new Date()) {
    throw new AppError("Verification code has expired", 400);
  }
  return true;
};

userSchema.pre("save", function (next) {
  if (!this.referalCode) {
    const prefix = (this.email?.split("@")[0] || this.phone || "user")
      .replace(/[^a-z0-9]/gi, "")
      .toLowerCase();
    this.referalCode = `${prefix}-${Math.floor(Math.random() * 10000)}`;
  }
  next();
});

userSchema.pre(/^find/, function (this: mongoose.Query<unknown, IUser>, next) {
  this.find({ isBlocked: { $ne: true } });
  next();
});

const User = mongoose.model<IUser, IUserModel>("User", userSchema);
export default User;
