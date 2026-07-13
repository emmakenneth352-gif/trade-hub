import express from "express";
import { catchAsync } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { Reel } from "../models/Reel";
import { ReelComment } from "../models/ReelComment";
import { seedAllTradeHubData } from "../utils/seed";

const formatReel = (reel: InstanceType<typeof Reel>) => ({
  id: reel.slug,
  sellerId: reel.sellerId,
  sellerName: reel.sellerName,
  sellerAvatar: reel.sellerAvatar,
  title: reel.title,
  caption: reel.caption,
  views: reel.views,
  likes: reel.likes,
  comments: reel.commentsCount,
  duration: reel.duration,
  thumbnail: reel.thumbnail,
  productId: reel.productId,
  musicId: reel.musicId,
});

export const getReels = catchAsync(async (_req: express.Request, res: express.Response) => {
  await seedAllTradeHubData();
  const reels = await Reel.find({ isActive: true }).sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    results: reels.length,
    data: { reels: reels.map(formatReel) },
  });
});

export const getReelById = catchAsync(async (req: express.Request, res: express.Response) => {
  await seedAllTradeHubData();
  const reel = await Reel.findOne({
    $or: [{ slug: req.params.id }, { _id: req.params.id }],
    isActive: true,
  });
  if (!reel) throw new AppError("Reel not found", 404);
  res.status(200).json({ status: "success", data: { reel: formatReel(reel) } });
});

export const getReelComments = catchAsync(async (req: express.Request, res: express.Response) => {
  const reel = await Reel.findOne({ slug: req.params.id });
  if (!reel) throw new AppError("Reel not found", 404);

  const comments = await ReelComment.find({ reelId: reel._id }).sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    data: {
      comments: comments.map((c) => ({
        id: c._id.toString(),
        user: c.user,
        avatar: c.avatar,
        text: c.text,
        time: c.createdAt,
      })),
    },
  });
});

export const addReelComment = catchAsync(async (req: express.Request, res: express.Response) => {
  const { text } = req.body;
  if (!text?.trim()) throw new AppError("Comment text is required", 400);

  const reel = await Reel.findOne({ slug: req.params.id });
  if (!reel) throw new AppError("Reel not found", 404);

  const comment = await ReelComment.create({
    reelId: reel._id,
    userId: req.user._id,
    user: req.user.firstName || "User",
    avatar: req.user.photo || "",
    text: text.trim(),
  });

  reel.commentsCount += 1;
  await reel.save();

  res.status(201).json({
    status: "success",
    data: {
      comment: {
        id: comment._id.toString(),
        user: comment.user,
        avatar: comment.avatar,
        text: comment.text,
        time: comment.createdAt,
      },
    },
  });
});

export const likeReel = catchAsync(async (req: express.Request, res: express.Response) => {
  const reel = await Reel.findOne({ slug: req.params.id });
  if (!reel) throw new AppError("Reel not found", 404);
  reel.likes += 1;
  await reel.save();
  res.status(200).json({ status: "success", data: { likes: reel.likes } });
});
