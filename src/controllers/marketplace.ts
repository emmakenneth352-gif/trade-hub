import express from "express";
import { Types } from "mongoose";
import { catchAsync } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import ApiFeatures from "../utils/apiFeatures";
import { Product } from "../models/Product";
import { marketplaceCategories } from "../data/catalog";
import { seedMarketplaceProducts } from "../utils/seed";

const formatProduct = (product: InstanceType<typeof Product>) => ({
  id: product._id.toString(),
  slug: product.slug,
  title: product.title,
  price: product.price.toString(),
  oldPrice: product.oldPrice?.toString(),
  discount: product.discount?.toString(),
  sold: product.sold,
  category: product.category,
  sellerName: product.sellerName,
  sellerAvatar: product.sellerAvatar,
  description: product.description,
  image: product.image,
  images: product.images,
  isFlashDeal: product.isFlashDeal,
});

export const getCategories = catchAsync(
  async (_req: express.Request, res: express.Response) => {
    res.status(200).json({
      status: "success",
      results: marketplaceCategories.length,
      data: { categories: marketplaceCategories.map((name) => ({ name })) },
    });
  }
);

export const getProducts = catchAsync(async (req: express.Request, res: express.Response) => {
  await seedMarketplaceProducts();

  const baseQuery = Product.find({ isActive: true });
  const features = new ApiFeatures(baseQuery, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (req.query.category) {
    features.getQuery().where({ category: req.query.category });
  }

  if (req.query.search) {
    const term = String(req.query.search).trim();
    features.getQuery().find({
      $or: [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { category: { $regex: term, $options: "i" } },
      ],
    });
  }

  const products = await features.getQuery();
  res.status(200).json({
    status: "success",
    results: products.length,
    data: { products: products.map(formatProduct) },
  });
});

export const getFlashDeals = catchAsync(
  async (_req: express.Request, res: express.Response) => {
    await seedMarketplaceProducts();
    const products = await Product.find({ isActive: true, isFlashDeal: true })
      .sort({ discount: -1 })
      .limit(20);

    res.status(200).json({
      status: "success",
      results: products.length,
      data: { products: products.map(formatProduct) },
    });
  }
);

export const getProductById = catchAsync(async (req: express.Request, res: express.Response) => {
  await seedMarketplaceProducts();
  const { id: rawId } = req.params;
  const id = String(rawId);

  const product =
    (await Product.findOne({ slug: id, isActive: true })) ||
    (Types.ObjectId.isValid(id) ? await Product.findOne({ _id: id, isActive: true }) : null);

  if (!product) throw new AppError("Product not found", 404);

  res.status(200).json({
    status: "success",
    data: { product: formatProduct(product) },
  });
});

export const createProduct = catchAsync(async (req: express.Request, res: express.Response) => {
  const { title, description, price, oldPrice, category, image, sellerName, sellerAvatar } =
    req.body;

  if (!title || !price || !category || !image) {
    throw new AppError("title, price, category, and image are required", 400);
  }

  const slug = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .concat(`-${Date.now()}`);

  const product = await Product.create({
    sellerId: req.user._id,
    slug,
    title,
    description: description || "",
    price: Number(price),
    oldPrice: oldPrice ? Number(oldPrice) : undefined,
    category,
    sellerName: sellerName || `${req.user.firstName || "Seller"}`,
    sellerAvatar: sellerAvatar || req.user.photo || "",
    image,
    images: [image],
    isFlashDeal: false,
    isActive: true,
  });

  res.status(201).json({
    status: "success",
    data: { product: formatProduct(product) },
  });
});
