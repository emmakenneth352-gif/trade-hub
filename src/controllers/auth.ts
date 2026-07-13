import express from "express";
import validator from "validator";
import User, { IUser } from "../models/User";
import { catchAsync } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { sendEmailOtp, sendPhoneOtp } from "../utils/otp";
import { signToken } from "../middleware/auth";
import { env } from "../config/env";

export type MessageResponse = {
  status: string;
  token?: string;
  company: string;
  data: object;
  message: string;
};

const DEFAULT_LOCATION = {
  type: "Point" as const,
  coordinates: [7.4951, 9.0578] as [number, number],
};

const createSendToken = (user: IUser, statusCode: number, res: express.Response) => {
  const token = signToken(user._id.toString());
  const cookieOptions: express.CookieOptions = {
    expires: new Date(Date.now() + env.jwtCookieExpiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: env.isProduction(),
    sameSite: "strict",
  };

  res.cookie(env.adminCookieName, token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    company: "Trade Hub",
    token,
    data: { user },
    message: "User has successfully logged in",
  });
};

export const signUp = catchAsync(
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { phone, email } = req.body ?? {};

    if (!phone && !email) {
      return next(new AppError("Please provide phone or email", 400));
    }
    if (email && !validator.isEmail(email)) {
      return next(new AppError("Please provide valid email", 400));
    }
    if (phone && !validator.isMobilePhone(phone, "any")) {
      return next(new AppError("Please provide valid phone number", 400));
    }

    if (email) {
      const user = await User.create({
        email: email.toLowerCase().trim(),
        location: DEFAULT_LOCATION,
      });
      const code = await user.createVerificationCode("email");
      await sendEmailOtp(email, code);

      return res.status(201).json({
        status: "success",
        company: "Trade Hub",
        data: { name: "Potential Customer" },
        message: `A verification code has been sent to your email ${email}`,
      });
    }

    const user = await User.create({ phone: phone.trim(), location: DEFAULT_LOCATION });
    const code = await user.createVerificationCode("phone");
    await sendPhoneOtp(phone, code);

    return res.status(201).json({
      status: "success",
      company: "Trade Hub",
      data: { name: "Potential Customer" },
      message: `A verification code has been sent to your phone ${phone}`,
    });
  }
);

export const verifyToken = catchAsync(
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { email, code, phone } = req.body ?? {};
    if (!email && !phone) {
      return next(new AppError("Please provide a number or email", 400));
    }
    if (!code) {
      return next(new AppError("Please provide code", 400));
    }

    const isEmail = !!email;
    const user = await User.findOne({
      [isEmail ? "email" : "phone"]: isEmail ? email.toLowerCase().trim() : phone.trim(),
    }).select("+verificationCode");

    if (!user) {
      return next(new AppError("No user exists with this email or phone", 400));
    }
    if (!user.verifyCode(Number(code))) {
      return next(new AppError("Invalid or expired verification code", 400));
    }

    if (isEmail) {
      user.emailVerified = true;
    } else {
      user.phoneVerified = true;
    }

    user.verificationCode = undefined;
    await user.save();
    createSendToken(user, 200, res);
  }
);

export const login = catchAsync(
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { email, phone } = req.body ?? {};

    if (!email && !phone) {
      return next(new AppError("Please provide email or phone number", 400));
    }
    if (email && !validator.isEmail(email)) {
      return next(new AppError("Please provide a valid email address", 400));
    }
    if (phone && !validator.isMobilePhone(phone, "any")) {
      return next(new AppError("Please provide a valid phone number", 400));
    }

    const query: Record<string, string> = {};
    if (email) query.email = email.toLowerCase().trim();
    if (phone) query.phone = phone.trim();

    const user = await User.findOne(query).select(
      "+verificationCode +emailVerified +phoneVerified +isBlocked"
    );

    if (!user) {
      return next(new AppError("Invalid credentials", 401));
    }
    if (user.isBlocked) {
      return next(new AppError("Sorry, you have been blocked by the admin", 403));
    }

    const isEmailLogin = Boolean(email);
    if (isEmailLogin && !user.emailVerified) {
      return next(new AppError("Your email has not been verified", 401));
    }
    if (!isEmailLogin && !user.phoneVerified) {
      return next(new AppError("Your phone number has not been verified", 401));
    }

    const code = await user.createVerificationCode(isEmailLogin ? "email" : "phone");
    const contactInfo = isEmailLogin ? email! : phone!;

    if (isEmailLogin) {
      await sendEmailOtp(contactInfo, code);
    } else {
      await sendPhoneOtp(contactInfo, code);
    }

    res.status(200).json({
      status: "success",
      company: "Trade Hub",
      message: `Verification code sent to ${contactInfo}`,
      data: {},
    } as MessageResponse);
  }
);

export const verifyLogin = catchAsync(
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { email, code, phone } = req.body ?? {};
    if (!email && !phone) {
      return next(new AppError("Please provide a number or email", 400));
    }
    if (!code) {
      return next(new AppError("Please provide code", 400));
    }

    const isEmail = !!email;
    const user = await User.findOne({
      [isEmail ? "email" : "phone"]: isEmail ? email.toLowerCase().trim() : phone.trim(),
    }).select("+verificationCode");

    if (!user) {
      return next(new AppError("No user exists with this email or phone", 400));
    }
    if (!user.emailVerified && !user.phoneVerified) {
      return next(new AppError("Your account has not been verified yet", 400));
    }

    user.verifyCode(Number(code));
    user.verificationCode = undefined;
    await user.save();
    createSendToken(user, 200, res);
  }
);

export const getProfile = catchAsync(
  async (req: express.Request, res: express.Response) => {
    res.status(200).json({
      status: "success",
      data: {
        profile: {
          userId: req.user,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          phone: req.user.phone,
          photo: req.user.photo,
          referalCode: req.user.referalCode,
        },
      },
    });
  }
);

export const logout = catchAsync(
  async (_req: express.Request, res: express.Response) => {
    res.cookie(env.adminCookieName, "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    res.status(200).json({ status: "success", message: "Logged out successfully" });
  }
);
