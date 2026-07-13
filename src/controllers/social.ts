import express from "express";
import { Types } from "mongoose";
import { catchAsync } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { TradingListing } from "../models/TradingListing";
import { Favorite } from "../models/Favorite";
import { Follow } from "../models/Follow";
import { Product } from "../models/Product";
import { seedAllTradeHubData } from "../utils/seed";

export const getTradingListings = catchAsync(
  async (_req: express.Request, res: express.Response) => {
    await seedAllTradeHubData();
    const items = await TradingListing.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      data: {
        items: items.map((t) => ({
          id: t.slug,
          title: t.title,
          type: t.type,
          offer: t.offer,
          location: t.location,
          sellerName: t.sellerName,
          description: t.description,
          image: t.image,
        })),
      },
    });
  }
);

export const createTradingListing = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const { title, type, offer, location, description, image } = req.body;
    if (!title || !type || !offer || !image) {
      throw new AppError("title, type, offer, and image are required", 400);
    }

    const slug = `trade-${Date.now()}`;
    const listing = await TradingListing.create({
      slug,
      title,
      type,
      offer,
      location: location || "",
      sellerName: req.user.firstName || "Trader",
      description: description || "",
      image,
      sellerId: req.user._id,
    });

    res.status(201).json({
      status: "success",
      data: {
        item: {
          id: listing.slug,
          title: listing.title,
          type: listing.type,
          offer: listing.offer,
          location: listing.location,
          sellerName: listing.sellerName,
          description: listing.description,
          image: listing.image,
        },
      },
    });
  }
);

export const getFavorites = catchAsync(async (req: express.Request, res: express.Response) => {
  const favorites = await Favorite.find({ userId: req.user._id }).populate("productId");
  const products = favorites
    .map((f) => f.productId as unknown as InstanceType<typeof Product>)
    .filter(Boolean)
    .map((p) => ({
      id: p._id.toString(),
      title: p.title,
      price: p.price.toString(),
      image: p.image,
      category: p.category,
      sellerName: p.sellerName,
    }));

  res.status(200).json({ status: "success", data: { products } });
});

export const addFavorite = catchAsync(async (req: express.Request, res: express.Response) => {
  const productId = String(req.params.productId);
  if (!Types.ObjectId.isValid(productId)) {
    throw new AppError("Invalid product id", 400);
  }

  await Favorite.findOneAndUpdate(
    { userId: req.user._id, productId },
    { userId: req.user._id, productId },
    { upsert: true }
  );

  res.status(200).json({ status: "success", message: "Added to favorites" });
});

export const removeFavorite = catchAsync(async (req: express.Request, res: express.Response) => {
  await Favorite.deleteOne({ userId: req.user._id, productId: req.params.productId });
  res.status(200).json({ status: "success", message: "Removed from favorites" });
});

export const followSeller = catchAsync(async (req: express.Request, res: express.Response) => {
  const { sellerSlug } = req.body;
  if (!sellerSlug) throw new AppError("sellerSlug is required", 400);

  await Follow.findOneAndUpdate(
    { followerId: req.user._id, sellerSlug },
    { followerId: req.user._id, sellerSlug },
    { upsert: true }
  );

  res.status(200).json({ status: "success", message: "Following seller" });
});

export const unfollowSeller = catchAsync(async (req: express.Request, res: express.Response) => {
  await Follow.deleteOne({ followerId: req.user._id, sellerSlug: req.params.sellerSlug });
  res.status(200).json({ status: "success", message: "Unfollowed seller" });
});

export const getFollowing = catchAsync(async (req: express.Request, res: express.Response) => {
  const following = await Follow.find({ followerId: req.user._id });
  res.status(200).json({
    status: "success",
    data: { following: following.map((f) => f.sellerSlug) },
  });
});

export const isFollowing = catchAsync(async (req: express.Request, res: express.Response) => {
  const exists = await Follow.exists({
    followerId: req.user._id,
    sellerSlug: req.params.sellerSlug,
  });
  res.status(200).json({ status: "success", data: { isFollowing: !!exists } });
});
