import express from "express";
import { catchAsync } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { LiveSession } from "../models/LiveSession";
import { LiveComment } from "../models/LiveComment";
import { SellerSubscription } from "../models/SellerSubscription";
import { seedAllTradeHubData } from "../utils/seed";

const FREE_LIVE_LIMIT = 2;

const formatLive = (live: InstanceType<typeof LiveSession>) => ({
  id: live.slug,
  sellerId: live.sellerId,
  sellerName: live.sellerName,
  title: live.title,
  viewers: live.viewers,
  avatar: live.avatar,
  thumbnail: live.thumbnail,
  musicId: live.musicId,
  isLive: live.isLive,
});

export const getLiveSessions = catchAsync(
  async (_req: express.Request, res: express.Response) => {
    await seedAllTradeHubData();
    const sessions = await LiveSession.find({ isLive: true }).sort({ viewers: -1 });
    res.status(200).json({
      status: "success",
      results: sessions.length,
      data: { liveSellers: sessions.map(formatLive) },
    });
  }
);

export const getLiveSession = catchAsync(async (req: express.Request, res: express.Response) => {
  const live = await LiveSession.findOne({ slug: req.params.id });
  if (!live) throw new AppError("Live session not found", 404);
  res.status(200).json({ status: "success", data: { live: formatLive(live) } });
});

export const getLiveComments = catchAsync(async (req: express.Request, res: express.Response) => {
  const live = await LiveSession.findOne({ slug: req.params.id });
  if (!live) throw new AppError("Live session not found", 404);
  const comments = await LiveComment.find({ liveId: live._id }).sort({ createdAt: -1 }).limit(50);
  res.status(200).json({
    status: "success",
    data: { comments: comments.map((c) => ({ user: c.user, text: c.text })) },
  });
});

export const addLiveComment = catchAsync(async (req: express.Request, res: express.Response) => {
  const { text } = req.body;
  if (!text?.trim()) throw new AppError("Comment is required", 400);
  const live = await LiveSession.findOne({ slug: req.params.id });
  if (!live) throw new AppError("Live session not found", 404);

  await LiveComment.create({
    liveId: live._id,
    user: req.user.firstName || "Viewer",
    text: text.trim(),
  });

  res.status(201).json({ status: "success", message: "Comment sent" });
});

export const startLiveSession = catchAsync(async (req: express.Request, res: express.Response) => {
  const { title, thumbnail, sellerSlug, sellerName, avatar, musicId } = req.body;

  const activeSub = await SellerSubscription.findOne({
    userId: req.user._id,
    active: true,
    expiresAt: { $gt: new Date() },
  });

  const usedCount = await LiveSession.countDocuments({
    sellerId: sellerSlug || req.user._id.toString(),
    startedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  if (!activeSub && usedCount >= FREE_LIVE_LIMIT) {
    throw new AppError("Free live limit reached. Upgrade to Seller Pro.", 403);
  }

  const slug = `live-${Date.now()}`;
  const session = await LiveSession.create({
    slug,
    sellerId: sellerSlug || req.user._id.toString(),
    sellerName: sellerName || req.user.firstName || "Seller",
    title: title || "Live shopping",
    viewers: 0,
    avatar: avatar || req.user.photo || "",
    thumbnail: thumbnail || "https://picsum.photos/seed/live-new/600/800",
    musicId,
    isLive: true,
    startedAt: new Date(),
  });

  res.status(201).json({
    status: "success",
    data: { live: formatLive(session), sessionsUsed: usedCount + 1 },
  });
});

export const endLiveSession = catchAsync(async (req: express.Request, res: express.Response) => {
  const live = await LiveSession.findOne({ slug: req.params.id });
  if (!live) throw new AppError("Live session not found", 404);
  live.isLive = false;
  live.endedAt = new Date();
  await live.save();
  res.status(200).json({ status: "success", message: "Live ended" });
});

export const getLiveAccess = catchAsync(async (req: express.Request, res: express.Response) => {
  const activeSub = await SellerSubscription.findOne({
    userId: req.user._id,
    active: true,
    expiresAt: { $gt: new Date() },
  });

  const usedCount = await LiveSession.countDocuments({
    sellerId: req.user._id.toString(),
    startedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  res.status(200).json({
    status: "success",
    data: {
      isPro: !!activeSub,
      freeLiveLimit: FREE_LIVE_LIMIT,
      sessionsUsed: usedCount,
      canGoLive: !!activeSub || usedCount < FREE_LIVE_LIMIT,
    },
  });
});
