import express, { NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { promisify } from "util";
import User, { IUser } from "../models/User";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

export type UserResponse = Omit<IUser, "verificationCode">;

declare global {
  namespace Express {
    interface Request {
      user: UserResponse;
    }
  }
}

type JwtPayload = { id: string; iat?: number };

const verifyAsync = promisify<string, string, JwtPayload>(
  jwt.verify as (
    token: string,
    secret: string,
    callback: (error: jwt.VerifyErrors | null, decoded: JwtPayload) => void
  ) => void
);

export const signToken = (id: string): string => {
  const expiresIn = Number.isFinite(Number(env.jwtExpiresIn))
    ? Number(env.jwtExpiresIn) * 24 * 60 * 60
    : 90 * 24 * 60 * 60;
  const options: SignOptions = { expiresIn };
  return jwt.sign({ id }, env.jwtSecret, options);
};

export const protectRoute = async (
  req: express.Request,
  _res: express.Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token =
      req.cookies?.[env.adminCookieName] ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : undefined);

    if (!token) {
      return next(new AppError("Authentication required. Please log in.", 401));
    }

    let decoded: JwtPayload;
    try {
      decoded = await verifyAsync(token, env.jwtSecret);
    } catch (err: unknown) {
      if (err instanceof jwt.TokenExpiredError) {
        return next(new AppError("Session expired. Please log in again.", 401));
      }
      if (err instanceof jwt.JsonWebTokenError) {
        return next(new AppError("Invalid token. Please log in again.", 401));
      }
      throw err;
    }

    const user = await User.findById(decoded.id).select(
      "email phone firstName lastName role isBlocked photo referalCode premium"
    );

    if (!user) {
      return next(
        new AppError("The account associated with this token no longer exists.", 401)
      );
    }
    if (user.isBlocked) {
      return next(new AppError("Your account has been blocked by an administrator.", 403));
    }

    req.user = user.toObject() as UserResponse;
    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError("Authentication failed", 500));
  }
};

export const restrictTo =
  (...roles: string[]) =>
  (req: express.Request, _res: express.Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    next();
  };
