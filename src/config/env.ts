import { AppError } from "../utils/AppError";

const DEV_DEFAULTS = {
  JWT_SECRET: "tradehub-local-dev-secret-key-min-32-chars",
  ADMIN_COOKIE: "tradehub_token",
};

const isDevMode = (): boolean => {
  const env = process.env.NODE_ENV;
  return !env || env === "development" || env === "test";
};

function normalizeEnvValue(value: string | undefined): string {
  if (!value) return "";
  let v = value.trim();

  if (v.toUpperCase().startsWith("DATABASE=")) {
    v = v.slice("DATABASE=".length).trim();
  }
  if (v.toUpperCase().startsWith("MONGODB_URI=")) {
    v = v.slice("MONGODB_URI=".length).trim();
  }

  while (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }

  return v;
}

function pickDatabaseRaw(): string {
  const candidates = [
    process.env.DATABASE,
    process.env.MONGODB_URI,
    process.env.MONGODB_URL,
    process.env.DATABASE_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeEnvValue(candidate);
    if (!normalized) continue;
    if (
      normalized.startsWith("mongodb://") ||
      normalized.startsWith("mongodb+srv://")
    ) {
      return normalized;
    }
  }

  return normalizeEnvValue(process.env.DATABASE || process.env.MONGODB_URI || "");
}

function resolveDatabaseUrl(): string {
  const url = pickDatabaseRaw().replace(
    "<PASSWORD>",
    encodeURIComponent(process.env.DBPASSWORD || "")
  );

  if (!url) {
    if (isDevMode()) return "mongodb://127.0.0.1:27017/tradehub";
    throw new AppError(
      "DATABASE is not set. In Render → Environment, add key DATABASE with your MongoDB Atlas mongodb+srv:// connection string.",
      500
    );
  }

  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    throw new AppError(
      "DATABASE points to PostgreSQL, but Trade Hub uses MongoDB. Delete DATABASE_URL from Postgres and set DATABASE to your mongodb+srv:// Atlas URL.",
      500
    );
  }

  if (!url.startsWith("mongodb://") && !url.startsWith("mongodb+srv://")) {
    const preview = url.slice(0, 20).replace(/[^\x20-\x7E]/g, "?");
    throw new AppError(
      `DATABASE is invalid (starts with "${preview}..."). In Render, key must be DATABASE and value must start with mongodb+srv:// — no quotes, no "DATABASE=" prefix.`,
      500
    );
  }

  return url;
}

export const env = {
  port: Number(process.env.PORT) || 3000,

  get database(): string {
    return resolveDatabaseUrl();
  },

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
