import { AppError } from "../utils/AppError";

const DEV_DEFAULTS = {
  JWT_SECRET: "tradehub-local-dev-secret-key-min-32-chars",
  ADMIN_COOKIE: "tradehub_token",
};

const isDevMode = (): boolean => {
  const env = process.env.NODE_ENV;
  return !env || env === "development" || env === "test";
};

export const env = {
  port: Number(process.env.PORT) || 3000,

  database:
    process.env.DATABASE?.replace(
      "<PASSWORD>",
      encodeURIComponent(process.env.DBPASSWORD || "")
    ) || "mongodb://127.0.0.1:27017/tradehub",

  get jwtSecret(): string {
    const value =
      process.env.JWT_SECRET || (isDevMode() ? DEV_DEFAULTS.JWT_SECRET : undefined);
    if (!value) throw new AppError("JWT_SECRET is not defined", 500);
    if (value.length < 32) {
      throw new AppError("JWT_SECRET must be at least 32 characters long", 500);
    }
    return value;
  },

  get jwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || "90d";
  },

  get jwtCookieExpiresIn(): number {
    return Number(process.env.JWT_COOKIE_EXPIRES_IN) || 90;
  },

  get adminCookieName(): string {
    return (
      process.env.ADMIN_COOKIE ||
      (isDevMode() ? DEV_DEFAULTS.ADMIN_COOKIE : undefined) ||
      (() => {
        throw new AppError("ADMIN_COOKIE is not defined", 500);
      })()
    );
  },

  get nodeEnv(): "development" | "production" | "test" {
    const nodeEnv = process.env.NODE_ENV;
    if (!nodeEnv) return "development";
    if (!["development", "production", "test"].includes(nodeEnv)) {
      throw new AppError(`Invalid NODE_ENV value: ${nodeEnv}`, 500);
    }
    return nodeEnv as "development" | "production" | "test";
  },

  isProduction(): boolean {
    return this.nodeEnv === "production";
  },

  isDevelopment(): boolean {
    return this.nodeEnv === "development";
  },

  /** NelloByte Systems VTU provider — https://www.nellobytesystems.com */
  get nelloByteUserId(): string | undefined {
    return process.env.NELLOBYTE_USER_ID;
  },

  get nelloByteApiKey(): string | undefined {
    return process.env.NELLOBYTE_API_KEY;
  },

  get nelloByteCallbackUrl(): string | undefined {
    return process.env.NELLOBYTE_CALLBACK_URL;
  },

  get cloudinaryUrl(): string | undefined {
    return process.env.CLOUDINARY_URL;
  },

  get cloudinaryCloudName(): string | undefined {
    return process.env.CLOUDINARY_CLOUD_NAME;
  },

  get cloudinaryApiKey(): string | undefined {
    return process.env.CLOUDINARY_API_KEY;
  },

  get cloudinaryApiSecret(): string | undefined {
    return process.env.CLOUDINARY_API_SECRET;
  },
};
