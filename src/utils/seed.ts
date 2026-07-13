import { Product } from "../models/Product";
import { Reel } from "../models/Reel";
import { LiveSession } from "../models/LiveSession";
import { TradingListing } from "../models/TradingListing";
import { SellerProfile } from "../models/SellerProfile";
import { ShopConversation } from "../models/ShopConversation";
import { Notification } from "../models/Notification";
import {
  seedProducts,
  seedReels,
  seedLiveSessions,
  seedTradingListings,
  seedSellerProfiles,
} from "../data/catalog";

export async function seedMarketplaceProducts(): Promise<number> {
  const count = await Product.countDocuments();
  if (count > 0) return count;

  await Product.insertMany(
    seedProducts.map((p) => ({
      ...p,
      images: [p.image],
      isFlashDeal: p.isFlashDeal ?? false,
      isActive: true,
    }))
  );

  return seedProducts.length;
}

export async function seedAllTradeHubData(): Promise<void> {
  await seedMarketplaceProducts();

  if ((await SellerProfile.countDocuments()) === 0) {
    await SellerProfile.insertMany(seedSellerProfiles);
  }

  if ((await Reel.countDocuments()) === 0) {
    await Reel.insertMany(seedReels);
  }

  if ((await LiveSession.countDocuments()) === 0) {
    await LiveSession.insertMany(
      seedLiveSessions.map((s) => ({ ...s, startedAt: new Date() }))
    );
  }

  if ((await TradingListing.countDocuments()) === 0) {
    await TradingListing.insertMany(seedTradingListings);
  }
}

export async function seedDemoConversations(userId: string): Promise<void> {
  const exists = await ShopConversation.findOne({ buyerId: userId });
  if (exists) return;

  await ShopConversation.insertMany([
    {
      buyerId: userId,
      sellerSlug: "seller-glow",
      sellerName: "Glow Beauty Store",
      sellerAvatar: "https://i.pravatar.cc/300?img=25",
      lastMessage: "Your bulk order is ready to ship!",
      unread: 2,
    },
    {
      buyerId: userId,
      sellerSlug: "seller-tech",
      sellerName: "Tech Wholesale Co.",
      sellerAvatar: "https://i.pravatar.cc/300?img=33",
      lastMessage: "Can you do 50 units at ₦16,500 each?",
      unread: 0,
    },
  ]);
}

export async function seedDemoNotifications(userId: string): Promise<void> {
  const count = await Notification.countDocuments({ userId });
  if (count > 0) return;

  await Notification.insertMany([
    {
      userId,
      title: "New order",
      message: "Someone viewed your Wireless Earbuds listing",
      type: "like",
    },
    {
      userId,
      title: "Live reminder",
      message: "Glow Beauty Store goes live in 30 minutes",
      type: "match",
    },
    {
      userId,
      title: "New message",
      message: "Tech Wholesale Co. replied to your offer",
      type: "chat",
    },
    {
      userId,
      title: "Flash deal",
      message: "Up to 70% off electronics — ends tonight",
      type: "promo",
    },
  ]);
}
