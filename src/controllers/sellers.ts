import express from "express";
import { catchAsync } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { SellerProfile } from "../models/SellerProfile";
import { Reel } from "../models/Reel";
import { UserPost } from "../models/UserPost";
import { seedAllTradeHubData } from "../utils/seed";

export const getSellerProfile = catchAsync(async (req: express.Request, res: express.Response) => {
  await seedAllTradeHubData();
  const profile = await SellerProfile.findOne({ slug: req.params.id });
  if (!profile) throw new AppError("Seller not found", 404);

  const reels = await Reel.find({ sellerId: profile.slug, isActive: true })
    .sort({ createdAt: -1 })
    .limit(12);

  const posts = reels.map((r) => ({
    id: r.slug,
    image: r.thumbnail,
    likes: r.likes,
    isVideo: true,
  }));

  res.status(200).json({
    status: "success",
    data: {
      profile: {
        id: profile.slug,
        name: profile.name,
        username: profile.username,
        avatar: profile.avatar,
        bio: profile.bio,
        followers: profile.followers,
        following: profile.following,
        category: profile.category,
        isPro: profile.isPro,
        posts,
      },
    },
  });
});

export const getSellerVideos = catchAsync(async (req: express.Request, res: express.Response) => {
  const reels = await Reel.find({ sellerId: req.params.id, isActive: true }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    status: "success",
    data: {
      videos: reels.map((r) => ({
        id: r.slug,
        sellerId: r.sellerId,
        sellerName: r.sellerName,
        sellerAvatar: r.sellerAvatar,
        title: r.title,
        caption: r.caption,
        views: r.views,
        likes: r.likes,
        thumbnail: r.thumbnail,
      })),
    },
  });
});

export const updateMyShopProfile = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const { name, username, bio, avatar, category, website, location } = req.body;
    const slug = `user-${req.user._id.toString()}`;

    const profile = await SellerProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        slug,
        userId: req.user._id,
        name: name || req.user.firstName,
        username: username || slug,
        bio: bio || "",
        avatar: avatar || req.user.photo,
        category: category || "Shop",
        website,
        location,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ status: "success", data: { profile } });
  }
);

export const getMyUserPosts = catchAsync(async (req: express.Request, res: express.Response) => {
  const posts = await UserPost.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    data: {
      posts: posts.map((p) => ({
        id: p._id.toString(),
        title: p.title,
        price: p.price,
        image: p.image,
        category: p.category,
        caption: p.caption,
        music: p.music,
        likes: p.likes,
        isVideo: p.isVideo,
      })),
    },
  });
});

export const createUserPost = catchAsync(async (req: express.Request, res: express.Response) => {
  const { title, price, image, category, caption, music, isVideo } = req.body;
  if (!title || !price || !image) {
    throw new AppError("title, price, and image are required", 400);
  }

  const post = await UserPost.create({
    userId: req.user._id,
    title,
    price: String(price),
    image,
    category: category || "General",
    caption,
    music,
    isVideo: !!isVideo,
  });

  res.status(201).json({
    status: "success",
    data: {
      post: {
        id: post._id.toString(),
        title: post.title,
        price: post.price,
        image: post.image,
        category: post.category,
        likes: post.likes,
        isVideo: post.isVideo,
      },
    },
  });
});
