import express from "express";
import { catchAsync } from "../utils/asyncHandler";
import { marketplaceMusicLibrary } from "../data/catalog";

export const getMusicLibrary = catchAsync(
  async (_req: express.Request, res: express.Response) => {
    res.status(200).json({
      status: "success",
      data: { tracks: marketplaceMusicLibrary },
    });
  }
);
