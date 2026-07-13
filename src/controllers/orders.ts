import express from "express";
import { Types } from "mongoose";
import { catchAsync } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { Wallet } from "../models/Wallet";
import { SellerSubscription } from "../models/SellerSubscription";
import { sellerProPlans, datingPremiumPlans } from "../data/catalog";

const COMMISSION_RATE = 0.05;
const PRO_COMMISSION_RATE = 0.03;

export const createOrder = catchAsync(async (req: express.Request, res: express.Response) => {
  const { productId, quantity = 1, shippingAddress } = req.body;
  if (!productId) throw new AppError("productId is required", 400);

  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new AppError("Product not found", 404);

  const qty = Math.max(1, Number(quantity));
  const unitPrice = product.price;
  const total = unitPrice * qty;

  const activeSub = await SellerSubscription.findOne({
    userId: product.sellerId,
    active: true,
    expiresAt: { $gt: new Date() },
  });
  const rate = activeSub ? PRO_COMMISSION_RATE : COMMISSION_RATE;
  const commission = Math.round(total * rate);

  const wallet = await Wallet.getOrCreate(new Types.ObjectId(req.user._id.toString()));
  if (wallet.balance < total) {
    throw new AppError("Insufficient wallet balance", 402);
  }

  wallet.balance -= total;
  await wallet.save();

  const order = await Order.create({
    buyerId: req.user._id,
    productId: product._id,
    sellerSlug: product.sellerName,
    productTitle: product.title,
    productImage: product.image,
    quantity: qty,
    unitPrice,
    total,
    commission,
    status: "paid",
    shippingAddress,
  });

  res.status(201).json({
    status: "success",
    data: {
      order: {
        id: order._id.toString(),
        productTitle: order.productTitle,
        total: order.total,
        status: order.status,
      },
      walletBalance: wallet.balance,
    },
  });
});

export const getOrders = catchAsync(async (req: express.Request, res: express.Response) => {
  const orders = await Order.find({ buyerId: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    data: {
      orders: orders.map((o) => ({
        id: o._id.toString(),
        productTitle: o.productTitle,
        productImage: o.productImage,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
      })),
    },
  });
});

export const getSubscriptionTypes = catchAsync(
  async (_req: express.Request, res: express.Response) => {
    res.status(200).json({
      status: "success",
      data: { types: datingPremiumPlans, sellerPro: sellerProPlans },
    });
  }
);

export const subscribeSellerPro = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const { plan } = req.body as { plan: "monthly" | "yearly" };
    const selected = sellerProPlans.find((p) => p.id === plan);
    if (!selected) throw new AppError("Invalid plan", 400);

    const wallet = await Wallet.getOrCreate(new Types.ObjectId(req.user._id.toString()));
    if (wallet.balance < selected.price) {
      throw new AppError("Insufficient wallet balance for Seller Pro", 402);
    }

    wallet.balance -= selected.price;
    await wallet.save();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + selected.durationDays);

    await SellerSubscription.updateMany({ userId: req.user._id }, { active: false });

    const sub = await SellerSubscription.create({
      userId: req.user._id,
      plan,
      amount: selected.price,
      active: true,
      expiresAt,
    });

    res.status(200).json({
      status: "success",
      message: "Seller Pro activated",
      data: {
        subscription: { plan: sub.plan, active: sub.active, expiresAt: sub.expiresAt },
        walletBalance: wallet.balance,
      },
    });
  }
);

export const getSellerProStatus = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const sub = await SellerSubscription.findOne({
      userId: req.user._id,
      active: true,
      expiresAt: { $gt: new Date() },
    });

    res.status(200).json({
      status: "success",
      data: {
        isPro: !!sub,
        subscription: sub ? { plan: sub.plan, expiresAt: sub.expiresAt } : null,
      },
    });
  }
);

export const initializeSubscriptionPayment = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const { planId, type = "dating" } = req.body;
    const plans = type === "seller_pro" ? sellerProPlans : datingPremiumPlans;
    const plan = plans.find((p) => p.id === planId);
    if (!plan) throw new AppError("Plan not found", 404);

    res.status(200).json({
      status: "success",
      data: {
        authorizationUrl: `https://checkout.paystack.com/demo/${planId}`,
        reference: `PAY-${Date.now()}`,
        amount: plan.price,
        plan,
      },
      message: "Payment initialized (demo)",
    });
  }
);
