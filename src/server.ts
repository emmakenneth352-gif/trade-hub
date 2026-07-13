import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";
import { env } from "./config/env";

const start = async () => {
  await mongoose.connect(env.database);
  console.log("MongoDB connected");

  app.listen(env.port, () => {
    console.log(`Trade Hub API running on http://localhost:${env.port}`);
    console.log(
      `NelloByte VTU: ${env.nelloByteUserId ? "configured" : "not configured (demo mode)"}`
    );
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
