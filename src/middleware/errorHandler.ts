import express from "express";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

export function errorHandler(
  err: unknown,
  req: express.Request,
  res: express.Response,
  _next: express.NextFunction
): void {
  const isProd = env.isProduction();
  const error = err as { message?: string; stack?: string; statusCode?: number };

  const errorContext = {
    message: error?.message || "Unknown error",
    stack: error?.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  };

  let message: string;
  let statusCode = error.statusCode || 500;

  if (err instanceof AppError && err.isOperational) {
    message = err.message;
    statusCode = err.statusCode;
  } else if (errorContext.message.includes("E11000 duplicate key error")) {
    message = "This user already exists";
    statusCode = 400;
  } else {
    message = isProd ? "Something went wrong" : errorContext.message;
  }

  if (isProd) {
    console.error("Production error:", {
      message: errorContext.message,
      url: errorContext.url,
      method: errorContext.method,
    });
  } else {
    console.error("Error details:", errorContext);
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? "error" : "fail",
    message,
  });
}
