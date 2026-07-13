import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import apiRouter from "./routes/api";
import legacyRouter from "./routes/legacy";
import { errorHandler } from "./middleware/errorHandler";
import { env } from "./config/env";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

if (!env.isProduction()) {
  app.use(morgan("dev"));
}

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "trade-hub-backend" });
});

app.use("/api/v1", apiRouter);
app.use("/", legacyRouter);

app.use(errorHandler);

export default app;
